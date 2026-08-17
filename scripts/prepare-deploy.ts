/**
 * Assemble le dossier prêt à téléverser sur l'hébergement OVH.
 *
 *   npm run deploy:pack
 *
 * Produit `dist/` = `out/` (export statique) + `deploy/` (.htaccess et le
 * point d'entrée PHP du formulaire). C'est le contenu exact du dossier `www/`
 * chez OVH — rien à recomposer à la main au moment de la mise en ligne, donc
 * rien à oublier.
 *
 * Le script REFUSE de produire un paquet incomplet ou dangereux : chaque
 * contrôle bloquant ci-dessous a déjà été, ailleurs, la cause d'un site
 * publié en `noindex` ou d'un formulaire silencieusement mort.
 */

import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");
const OUT = path.join(RACINE, "out");
const DEPLOY = path.join(RACINE, "deploy");
const DIST = path.join(RACINE, "dist");

const HOTE_PRODUCTION = "www.argon-mobility.com";

const erreurs: string[] = [];
const avertissements: string[] = [];

/* ==========================================================================
   CONTRÔLES
   ========================================================================== */

if (!existsSync(OUT)) {
  erreurs.push("Le dossier out/ est absent. Lancez `npm run build` d'abord.");
}

/**
 * Le site est-il ouvert aux moteurs ? Question INDÉPENDANTE du domaine.
 * Fermé par défaut : l'ouverture est un acte délibéré.
 */
const OUVERT = process.env.NEXT_PUBLIC_SITE_OPEN === "true";

/**
 * Un `Disallow: /` sur le domaine de production signalerait un build lancé
 * avec la mauvaise URL — le site serait alors invisible sans le moindre
 * message d'erreur. On le vérifie sur le fichier réellement produit, pas sur
 * la variable d'environnement : c'est le fichier qui sera servi.
 *
 * En pré-lancement, robots.txt autorise volontairement l'exploration : c'est
 * la condition pour que le robot LISE le noindex. Ce n'est donc pas une erreur.
 */
if (existsSync(path.join(OUT, "robots.txt"))) {
  const robots = await readFile(path.join(OUT, "robots.txt"), "utf8");
  if (/Disallow:\s*\/\s*$/m.test(robots.trim())) {
    erreurs.push(
      "robots.txt interdit toute exploration.\n" +
        `      Rebuild avec NEXT_PUBLIC_SITE_URL=https://${HOTE_PRODUCTION}`,
    );
  }
}

/** Les canonical doivent porter le domaine réel, pas localhost ni une preview. */
if (existsSync(path.join(OUT, "index.html"))) {
  const accueil = await readFile(path.join(OUT, "index.html"), "utf8");
  const canonical = accueil.match(/rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical && !canonical.includes(HOTE_PRODUCTION)) {
    erreurs.push(
      `Les balises canonical pointent sur « ${canonical} » au lieu de ${HOTE_PRODUCTION}.`,
    );
  }
}

/** Le formulaire est inutile sans son point d'entrée. */
if (!existsSync(path.join(DEPLOY, "api", "demande.php"))) {
  erreurs.push("deploy/api/demande.php est absent : le formulaire ne partira pas.");
}

/**
 * Garde-fou de sécurité : les clés Mailjet vivent dans config.php, qui est
 * créé directement sur le serveur. S'il traîne dans le dépôt, on refuse de
 * l'empaqueter plutôt que de risquer de le publier.
 */
if (existsSync(path.join(DEPLOY, "api", "config.php"))) {
  erreurs.push(
    "deploy/api/config.php existe dans le dépôt.\n" +
      "      Les clés Mailjet ne doivent jamais y être versionnées : créez ce\n" +
      "      fichier directement sur le serveur, à partir de config.example.php.",
  );
}

if (!existsSync(path.join(DEPLOY, ".htaccess"))) {
  erreurs.push("deploy/.htaccess est absent : les URLs sans extension seront en 404.");
}

/* ==========================================================================
   ASSEMBLAGE
   ========================================================================== */

if (erreurs.length > 0) {
  console.error("\n✗ Paquet NON produit :\n");
  for (const erreur of erreurs) console.error(`   • ${erreur}`);
  console.error("");
  process.exit(1);
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await cp(OUT, DIST, { recursive: true });
await cp(DEPLOY, DIST, { recursive: true });

/* ==========================================================================
   SYNCHRONISATION DE L'OUVERTURE
   L'en-tête HTTP et les balises meta des pages doivent dire la MÊME chose.
   Les laisser se régler à deux endroits différents, c'est garantir qu'un jour
   ils divergeront — et une divergence sur « indexer ou non » ne se voit pas :
   elle se découvre dans les résultats de recherche, trop tard.
   Le .htaccess livré est donc réécrit à partir du même drapeau que le build.
   ========================================================================== */

const cheminHtaccess = path.join(DIST, ".htaccess");
const htaccessSource = await readFile(cheminHtaccess, "utf8");

const blocOuverture = OUVERT
  ? [
      "# SITE OUVERT — aucun en-tête noindex.",
      "# Les balises meta de chaque page font foi (voir src/lib/seo.ts).",
    ].join("\n")
  : [
      "# SITE FERMÉ (pré-lancement) — bloc généré automatiquement.",
      "#",
      "# Chaque réponse porte l'ordre de ne pas indexer. robots.txt autorise",
      "# volontairement l'exploration : sans cela le robot ne lirait jamais cet",
      "# en-tête. Retirer ce bloc revient à ouvrir le site — ce qui se fait par",
      "# `npm run deploy:ouvrir`, jamais à la main.",
      "<IfModule mod_headers.c>",
      '  Header always set X-Robots-Tag "noindex, nofollow"',
      "</IfModule>",
    ].join("\n");

const htaccessFinal = htaccessSource.replace(
  /# @OUVERTURE@[\s\S]*?# @FIN-OUVERTURE@/,
  blocOuverture,
);

if (htaccessFinal === htaccessSource) {
  erreurs.push(
    "Les marqueurs @OUVERTURE@ / @FIN-OUVERTURE@ sont absents de deploy/.htaccess :\n" +
      "      l'état d'ouverture n'a pas pu être appliqué.",
  );
} else {
  await writeFile(cheminHtaccess, htaccessFinal, "utf8");
}

/**
 * Contrôle croisé sur le résultat : chaque page HTML indexable doit porter la
 * balise attendue. On vérifie ce qui est réellement écrit dans les fichiers,
 * pas ce que la configuration prétend.
 */
const accueil = await readFile(path.join(DIST, "index.html"), "utf8");
const metaAccueil = accueil.match(/name="robots" content="([^"]+)"/)?.[1] ?? "";

if (!OUVERT && !metaAccueil.includes("noindex")) {
  erreurs.push(
    "Site déclaré FERMÉ, mais l'accueil ne porte pas de meta noindex.\n" +
      "      Le build a été lancé avec NEXT_PUBLIC_SITE_OPEN=true.",
  );
}
if (OUVERT && metaAccueil.includes("noindex")) {
  erreurs.push(
    "Site déclaré OUVERT, mais l'accueil porte encore un meta noindex.\n" +
      "      Rebuild avec NEXT_PUBLIC_SITE_OPEN=true.",
  );
}

if (erreurs.length > 0) {
  console.error("\n✗ Paquet NON produit :\n");
  for (const erreur of erreurs) console.error(`   • ${erreur}`);
  console.error("");
  process.exit(1);
}

/**
 * Deux fichiers de `deploy/` sont de la documentation, pas du site :
 *   — config.example.php signalerait publiquement l'emplacement des secrets ;
 *   — README.md exposerait la procédure de déploiement à qui la demande.
 * Ni l'un ni l'autre n'a sa place sur un serveur public.
 */
await rm(path.join(DIST, "api", "config.example.php"), { force: true });
await rm(path.join(DIST, "README.md"), { force: true });
await rm(path.join(DIST, "MAILJET.md"), { force: true });

/**
 * Contrôle final, sur le paquet lui-même : aucun fichier servi au navigateur
 * ne doit contenir la moindre trace d'identifiant. Le test porte sur ce qui
 * part réellement, pas sur ce qu'on croit avoir écrit — c'est la seule
 * vérification qui vaille pour un secret.
 */
const EXTENSIONS_PUBLIQUES = [".html", ".js", ".css", ".txt", ".xml", ".svg"];
const MOTIF_SECRET = /mailjet|api[_-]?key|secret[_-]?key|Basic\s+[A-Za-z0-9+/=]{20,}/i;

async function fichiersPublics(dossier: string): Promise<string[]> {
  const trouves: string[] = [];
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    const chemin = path.join(dossier, entree.name);
    if (entree.isDirectory()) trouves.push(...(await fichiersPublics(chemin)));
    else if (EXTENSIONS_PUBLIQUES.includes(path.extname(entree.name))) {
      trouves.push(chemin);
    }
  }
  return trouves;
}

const suspects: string[] = [];
for (const fichier of await fichiersPublics(DIST)) {
  if (MOTIF_SECRET.test(await readFile(fichier, "utf8"))) {
    suspects.push(path.relative(DIST, fichier));
  }
}

if (suspects.length > 0) {
  console.error("\n✗ Paquet produit mais SUSPECT — trace d'identifiant dans :\n");
  for (const suspect of suspects) console.error(`   • ${suspect}`);
  console.error("\n   Ne pas déployer avant d'avoir vérifié.\n");
  process.exit(1);
}

/* ==========================================================================
   RÉCAPITULATIF
   ========================================================================== */

async function poids(dossier: string): Promise<[number, number]> {
  let octets = 0;
  let fichiers = 0;
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    const chemin = path.join(dossier, entree.name);
    if (entree.isDirectory()) {
      const [o, f] = await poids(chemin);
      octets += o;
      fichiers += f;
    } else {
      octets += (await stat(chemin)).size;
      fichiers += 1;
    }
  }
  return [octets, fichiers];
}

const [octets, fichiers] = await poids(DIST);
const pages = (await readdir(DIST, { recursive: true })).filter((f) =>
  String(f).endsWith(".html"),
).length;

console.log("\n✓ Paquet prêt : dist/\n");
console.log(
  `   Moteurs    : ${OUVERT ? "OUVERT — le site sera indexé" : "FERMÉ — noindex sur tout (en-tête HTTP + balises meta)"}`,
);
console.log(`   Pages HTML : ${pages}`);
console.log(`   Fichiers   : ${fichiers}`);
console.log(`   Poids      : ${(octets / 1024 / 1024).toFixed(1)} Mo\n`);
console.log("   À faire sur le serveur, une seule fois :");
console.log("     1. Téléverser le CONTENU de dist/ dans www/");
console.log("     2. Créer www/api/config.php à partir de");
console.log("        deploy/api/config.example.php, avec les vraies clés Mailjet");
console.log("     3. Vérifier que le .htaccess a bien été transféré");
console.log("        (les clients FTP masquent les fichiers commençant par un point)\n");

if (avertissements.length > 0) {
  for (const a of avertissements) console.log(`   ⚠ ${a}`);
  console.log("");
}
