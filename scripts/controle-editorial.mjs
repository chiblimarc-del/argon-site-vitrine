// @ts-check
/**
 * CONTRÔLE ÉDITORIAL DU SITE ARGON — lecture seule, ne modifie rien.
 *
 *   npm run controle
 *
 * Cinq points, tous vérifiés sur la SOURCE et jamais sur le HTML rendu :
 * Next duplique chaque chaîne dans la charge d'hydratation, et compter
 * dans `out/` donne trois à cinq fois le bon nombre.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QUE CE CONTRÔLE A APPRIS, ET QU'IL NE FAUT PAS DÉFAIRE
 *
 * Sa première version remontait 80 signalements dont la quasi-totalité
 * était du bruit. Trois défauts, tous instructifs :
 *
 *   · `FEC` sans limite de mot attrapait « affectée », « effectif »,
 *     « effet » — l'essentiel de la liste ;
 *   · les phrases de FRONTIÈRE étaient comptées comme des fautes, alors
 *     qu'elles sont exactement ce qu'on veut lire ;
 *   · les chemins Windows utilisent `\`, donc le contrôle des maquettes
 *     ne testait rien du tout.
 *
 * ⚠️ UN CONTRÔLE QUI REMONTE 80 FAUX POSITIFS NE SERA PLUS JAMAIS LU.
 *    Le premier travail d'un contrôle est de mériter qu'on le croie.
 *    Avant d'élargir un motif, vérifier ce qu'il attrape en plus.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename, sep } from "node:path";

/**
 * Un terme interdit n'est un défaut que si le site l'AFFIRME.
 * Il ne l'est pas quand une FAQ pose l'objection dans les mots du visiteur,
 * ni quand une frontière dit qu'Argon ne le fait PAS — c'est même l'inverse
 * d'un défaut, et le site en tire son crédit.
 */
const TERMES = [
  [/automatiquement/i, "laisse entendre qu'une machine décide"],
  [/automatisations?/i, "même famille"],
  [/automatiser/i, "même famille"],
  [/en temps r[ée]el/i, "promesse technique invérifiable"],
  [/synchronisation/i, "vocabulaire d'éditeur, pas de dirigeant"],
  [/connecteurs?/i, "idem"],
  [/int[ée]grations?/i, "idem"],
  [/\bAPI\b/, "idem"],
  [/\bFEC\b/, "sujet comptable hors périmètre"],
  [/pointeuse/i, "tête de marché des badgeuses"],
  [/badgeuse/i, "idem"],
  [/bulletin de paie/i, "hors périmètre"],
  [/\bDSN\b/, "hors périmètre"],
  [/majoration l[ée]gale/i, "Argon ne calcule rien de tel"],
  [/rapprochement bancaire/i, "hors périmètre"],
  [/partie double/i, "hors périmètre"],
  [/sans engagement/i, "INTERDIT, et faux depuis le Lot 5"],
];

/**
 * Un identifiant de code n'est pas du texte publié.
 *
 * `<Connecteur />`, `function Connecteur()` et `const Connecteur =` sont des
 * noms de composants React : ils ne sortent jamais dans le HTML servi. Les
 * compter était exactement l'erreur de « affectée » pour FEC — trois
 * signalements permanents que personne ne peut corriger, dans un contrôle
 * qu'on finit par ne plus lire.
 *
 * ⚠️ On neutralise l'IDENTIFIANT, pas la ligne. `<Card title="API">` continue
 * d'être lu, et son « API » reste un défaut.
 *
 * Les lignes de plomberie de module — `import …`, `export { … }`,
 * `export * from …` — ne portent que des noms : elles sortent entières.
 * `export const DIFFERENCIATION = { … }`, lui, porte du texte publié et reste
 * lu ligne à ligne.
 */
const IDENTIFIANT = /(?:<\/?|function\s+|class\s+|const\s+|let\s+)[A-Z][A-Za-z0-9_]*/g;
const PLOMBERIE = /^\s*(?:import\b|export\s*\*|export\s*\{)/;
const sansIdentifiants = (ligne) =>
  PLOMBERIE.test(ligne) ? "" : ligne.replace(IDENTIFIANT, " ");

/**
 * EXEMPTIONS — nommées, motivées, et aussi étroites que possible.
 *
 * ⚠️ Une exemption sans motif écrit est une désactivation déguisée. Chacune
 * porte donc trois choses : le FICHIER, les TERMES précis, et le MOTIF. Jamais
 * un fichier entier, jamais « tous les termes ».
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Pourquoi `src/lib/tarifs.ts` en a une (arbitrage du 26/08/2026)
 *
 * Deux règles du projet se contredisaient sur ce fichier, et il fallait
 * trancher plutôt que laisser dix signalements permanents.
 *
 *   · La règle éditoriale bannit « API », « intégration » et « automatisation »
 *     comme du VOCABULAIRE D'ÉDITEUR : un dirigeant qui cherche un logiciel de
 *     terrain ne parle pas comme ça, et le site refuse de lui vendre en jargon.
 *
 *   · La règle du Lot 5 fait de `/tarifs` la seule page où **une ligne cochée
 *     dans une colonne payante est un engagement contractuel opposable**.
 *
 * La première vise la PROSE QUI PERSUADE. La seconde régit une ÉNUMÉRATION DE
 * CE QUI EST VENDU — lue par le dirigeant, mais aussi par son informaticien et
 * par son comptable, qui cherchent ces mots-là et pas leurs synonymes.
 * Rebaptiser « API » en une formule de terrain n'aurait pas rendu la ligne plus
 * claire : cela aurait rendu l'engagement plus flou.
 *
 * ⚠️ L'exemption ne porte QUE sur ces trois noms de fonctions. Dans le même
 * fichier, « automatiquement », « en temps réel », « sans engagement » et tous
 * les autres termes restent surveillés — ce sont des PROMESSES, pas des lignes
 * de contrat, et c'est précisément ce que la règle éditoriale existe pour
 * arrêter.
 * ─────────────────────────────────────────────────────────────────────────
 */
const EXEMPTIONS = [
  {
    fichier: "src/lib/tarifs.ts",
    termes: [/\bAPI\b/, /int[ée]grations?/i, /automatisations?/i],
    motif: "noms de fonctions du comparatif contractuel (arbitrage du 26/08/2026)",
  },
];

/** Ce terme est-il exempté DANS ce fichier ? */
const exempte = (chemin, motif) =>
  EXEMPTIONS.some(
    (e) => e.fichier === chemin && e.termes.some((t) => t.source === motif.source),
  );

/** La phrase dit qu'Argon ne le fait pas. */
const NEGATION =
  /\bne\b|\bn['']|aucun|pas de |pas d['']|sans |\bNon\b|jamais|frontiere|frontière/i;

/**
 * Les entrées d'une liste de frontière ne portent aucune négation sur leur
 * propre ligne : c'est le nom du tableau qui la porte. On suit donc l'état.
 */
const LISTE_FRONTIERE = /nonCouvert|horsPerimetre|frontiere|resteA/;

/** ⚠️ Mot pour mot. Une frontière reformulée cesse d'être une frontière. */
const FORMULE =
  "Argon ne tient pas votre comptabilité. Il prépare, centralise et " +
  "alimente les informations et documents nécessaires à leur exploitation.";

const LEGENDE = "reproduite en code";

/** Tous les fichiers TypeScript de `src`, chemins normalisés en `/`. */
function fichiersSource(racine = "src") {
  const trouves = [];
  for (const nom of readdirSync(racine)) {
    const chemin = join(racine, nom);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiersSource(chemin));
    else if (/\.tsx?$/.test(nom)) trouves.push(chemin.split(sep).join("/"));
  }
  return trouves.sort();
}

/** Les seules lignes de code : blocs `/* *\/` et `//` exclus. */
function lignesDeCode(chemin) {
  const rendu = [];
  let dansBloc = false;
  readFileSync(chemin, "utf8")
    .split("\n")
    .forEach((l, i) => {
      const s = l.trim();
      if (dansBloc) {
        if (s.includes("*/")) dansBloc = false;
        return;
      }
      if (s.startsWith("/*") || s.startsWith("{/*")) {
        if (!s.includes("*/")) dansBloc = true;
        return;
      }
      if (s.startsWith("//") || s.startsWith("*")) return;
      rendu.push([i + 1, l]);
    });
  return rendu;
}

const titre = (n, t) =>
  console.log(`\n${"=".repeat(74)}\n${n}. ${t}\n${"=".repeat(74)}`);

const fichiers = fichiersSource();
let defauts = 0;

/* ══ 1. VOCABULAIRE ═══════════════════════════════════════════════ */
titre(1, "VOCABULAIRE");

for (const [motif, raison] of TERMES) {
  const affirme = [];
  let frontiere = 0;
  let question = 0;

  const exemptes = [];

  for (const chemin of fichiers) {
    if (exempte(chemin, motif)) {
      exemptes.push(chemin);
      continue;
    }
    let dansListe = false;
    for (const [n, l] of lignesDeCode(chemin)) {
      if (LISTE_FRONTIERE.test(l)) dansListe = true;
      else if (dansListe && /^\s*[\]}]/.test(l)) dansListe = false;
      if (!motif.test(sansIdentifiants(l))) continue;

      if (dansListe || NEGATION.test(l) || l.includes("frontiere=")) frontiere++;
      else if (l.includes("question:")) question++;
      else affirme.push([chemin, n, l.trim().slice(0, 110)]);
    }
  }

  const nom = motif.source.replace(/\\b/g, "").replace(/s\?/g, "");
  if (affirme.length) {
    defauts += affirme.length;
    console.log(`\n⚠️  « ${nom} » — ${raison}`);
    for (const [f, n, l] of affirme) console.log(`     ${f}:${n}\n       ${l}`);
  } else if (frontiere || question || exemptes.length) {
    const d = [];
    if (frontiere) d.push(`${frontiere} en frontière`);
    if (question) d.push(`${question} en question de FAQ`);
    if (exemptes.length) d.push(`${exemptes.length} fichier(s) exempté(s)`);
    console.log(`\n✅  « ${nom} » — ${d.join(", ")}. Conforme.`);
    // ⚠️ Une exemption qui ne se voit pas finit par être oubliée, puis par
    // couvrir autre chose que ce pour quoi elle a été écrite.
    for (const f of exemptes) {
      const e = EXEMPTIONS.find((x) => x.fichier === f);
      console.log(`     exempté dans ${f} — ${e.motif}`);
    }
  }
}
console.log(`\n>>> ${defauts} affirmation(s) à examiner`);

/* ══ 2. LA FORMULE COMPTABLE ══════════════════════════════════════ */
titre(2, "LA FORMULE COMPTABLE — mot pour mot, ou pas du tout");

let exactes = 0;
let reformulees = 0;
for (const chemin of fichiers) {
  const plat = readFileSync(chemin, "utf8").replace(/\s+/g, " ");
  if (plat.includes(FORMULE)) {
    console.log(`   ✅ ${chemin}`);
    exactes++;
  } else if (plat.includes("ne tient pas votre comptabilité")) {
    console.log(`   ⚠️  ${chemin} — présente mais REFORMULÉE`);
    reformulees++;
  }
}
console.log(`\n>>> ${exactes} exacte(s), ${reformulees} reformulée(s)`);

/* ══ 3. APOSTROPHES TYPOGRAPHIQUES ════════════════════════════════ */
titre(3, "APOSTROPHES TYPOGRAPHIQUES");

const apostrophes = fichiers.reduce(
  (t, f) => t + (readFileSync(f, "utf8").match(/\u2019/g) || []).length,
  0,
);
console.log(`>>> ${apostrophes}${apostrophes ? " ⚠️" : " — conforme"}`);

/* ══ 4. MAQUETTES ═════════════════════════════════════════════════ */
titre(4, "MAQUETTES — chacune doit porter sa légende");

const maquettes = fichiers.filter(
  (f) => f.includes("/mockups/") || f.includes("/product-ui/"),
);
if (!maquettes.length) console.log("   ⚠️  aucune maquette trouvée");
let legendesManquantes = 0;

for (const chemin of maquettes) {
  const nom = basename(chemin).replace(/\.tsx?$/, "");
  const porteSaLegende = readFileSync(chemin, "utf8").includes(LEGENDE);
  const utilise = [];
  const sans = [];

  for (const autre of fichiers) {
    if (autre === chemin) continue;
    const t = readFileSync(autre, "utf8");
    if (!new RegExp(`<${nom}\\b`).test(t)) continue;
    utilise.push(autre);
    if (!porteSaLegende && !t.includes(LEGENDE)) sans.push(autre);
  }

  if (!utilise.length) console.log(`   ·  ${nom} — monté nulle part`);
  else if (sans.length) {
    legendesManquantes += sans.length;
    console.log(`   ⚠️  ${nom} — légende absente dans : ${sans.join(", ")}`);
  }
  else console.log(`   ✅ ${nom} (${utilise.length} page(s))`);
}

/* ══ 5. LA CAPTURE DU TABLEAU DE BORD ═════════════════════════════ */
titre(5, "LA CAPTURE DU TABLEAU DE BORD");

/**
 * ⚠️ La déclaration porte un type qui s'étale sur plusieurs lignes et
 *    contient lui-même des « ; ». Une version antérieure lisait ligne à
 *    ligne et concluait « n'est plus null » sur un fichier parfaitement sain.
 */
let vue = false;
for (const chemin of fichiers) {
  const m = readFileSync(chemin, "utf8").match(
    /(?:const|let)\s+CAPTURE_TABLEAU_DE_BORD[\s\S]*?=\s*([^;]+);/,
  );
  if (!m) continue;
  vue = true;
  const nul = m[1].trim() === "null";
  console.log(
    `   ${nul ? "✅ null" : "⚠️  N'EST PLUS NULL —"} ${chemin} — ` +
      m[0].replace(/\s+/g, " ").slice(0, 100),
  );
}
if (!vue) console.log("   ⚠️  déclaration introuvable");

/* ══ VERDICT ═════════════════════════════════════════════════════ */
titre(6, "VERDICT");

/**
 * ⚠️ Ce contrôle est BLOQUANT depuis le 26/08/2026.
 *
 * Jusque-là il sortait en code 0 quoi qu'il signale, et il signalait dix
 * affirmations permanentes que personne ne pouvait corriger — un contrôle qui
 * n'empêche jamais rien finit par ne plus être lu. Les dix ont été arbitrées
 * (voir la table EXEMPTIONS), et il ne reste que de vrais défauts.
 *
 * Ce qui FAIT ÉCHOUER : une affirmation en vocabulaire interdit, la formule
 * comptable reformulée, une apostrophe typographique, une maquette montée sans
 * sa légende. Chacun se corrige, et chacun est un défaut.
 *
 * Ce qui NE FAIT PAS échouer, délibérément : le § 5. `CAPTURE_TABLEAU_DE_BORD`
 * qui cesse d'être `null` n'est pas une faute — c'est le jour où une vraie
 * capture arrive, et il serait absurde de bloquer là-dessus. C'est une veille,
 * pas une barrière.
 */
const total = defauts + reformulees + apostrophes + legendesManquantes;

if (!total) {
  console.log("   ✅ Aucun défaut éditorial.\n");
  process.exit(0);
}

console.log(`   ⚠️  ${total} défaut(s) :`);
if (defauts) console.log(`      ${defauts} affirmation(s) en vocabulaire interdit`);
if (reformulees) console.log(`      ${reformulees} formule(s) comptable(s) reformulée(s)`);
if (apostrophes) console.log(`      ${apostrophes} apostrophe(s) typographique(s)`);
if (legendesManquantes) console.log(`      ${legendesManquantes} maquette(s) sans légende`);
console.log();
process.exit(1);
