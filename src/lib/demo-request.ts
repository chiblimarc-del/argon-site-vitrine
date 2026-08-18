import { secteurRoutes } from "@/lib/routes";

/**
 * Contrat partagé du formulaire de demande de démonstration.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ⚠️ OÙ VIT RÉELLEMENT LA LOGIQUE
 *
 * Le site est livré en export statique : aucun code de ce fichier ne s'exécute
 * en production côté serveur. La validation, l'anti-robot et l'envoi Mailjet
 * sont implémentés dans `deploy/api/demande.php`, qui est le SEUL point de
 * décision — un formulaire posté peut venir de n'importe où, jamais du
 * navigateur qu'on croit.
 *
 * Ce fichier ne conserve donc que ce qui doit rester identique des deux côtés :
 * les noms de champs, les options du sélecteur et les motifs de saisie.
 * Toute modification ici doit être répercutée dans demande.php, et
 * réciproquement. C'est le prix d'un site sans serveur applicatif.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type ChampDemo = "nom" | "entreprise" | "email" | "telephone" | "secteur";

/**
 * Cible du POST. Chemin absolu : la page est servie depuis /demander-une-demo,
 * un chemin relatif viserait /demander-une-demo/api/demande.php.
 */
export const ENDPOINT_DEMANDE = "/api/demande.php";

/** Options du sélecteur, dérivées du registre — jamais écrites en dur. */
export const optionsSecteur = [
  ...secteurRoutes.map((route) => ({ valeur: route.path, libelle: route.label })),
  { valeur: "autre", libelle: "Autre activité" },
];

/* ==========================================================================
   MOTIFS DE SAISIE
   Utilisés comme attribut `pattern` : le navigateur les ancre lui-même, on
   n'écrit donc ni ^ ni $. Volontairement permissifs — chaque règle trop
   stricte est une demande perdue.
   ========================================================================== */

/** Forme d'une adresse e-mail. On vérifie une forme, pas une norme. */
export const MOTIF_EMAIL = "[^\\s@]+@[^\\s@]+\\.[a-zA-Z]{2,}";

/**
 * Téléphone : chiffres, espaces, points, tirets, parenthèses et indicatif.
 * On n'impose pas le format français : un prospect peut appeler d'ailleurs.
 */
export const MOTIF_TELEPHONE = "[+0-9][0-9\\s.()\\-]{7,19}";

/* ==========================================================================
   SUGGESTION DE CORRECTION D'ADRESSE
   Une adresse peut être syntaxiquement parfaite et pourtant inutilisable. Le
   cas s'est produit le 18/08/2026 sur ce site : « gamil.com » au lieu de
   « gmail.com ». Le domaine EXISTE — c'est un typosquat enregistré, avec de
   vrais enregistrements MX — donc ni la validation de forme, ni une
   vérification DNS ne peuvent le signaler. Seule une comparaison aux domaines
   courants le peut, et elle doit se faire dans le navigateur, tant que le
   visiteur a encore le champ sous les yeux.

   ⚠️ La suggestion ne bloque JAMAIS et ne corrige JAMAIS d'office. Elle pose
   une question, le visiteur répond. Un domaine d'entreprise légitime qui
   ressemblerait par hasard à un fournisseur grand public ne doit pas être
   réécrit dans le dos de celui qui le saisit.
   ========================================================================== */

/** Fournisseurs grand public les plus fréquents en France. */
const DOMAINES_COURANTS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "outlook.fr",
  "hotmail.com",
  "hotmail.fr",
  "live.fr",
  "live.com",
  "yahoo.fr",
  "yahoo.com",
  "orange.fr",
  "wanadoo.fr",
  "free.fr",
  "sfr.fr",
  "laposte.net",
  "bbox.fr",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "proton.me",
];

/** Distance de Levenshtein, itérative : deux lignes suffisent. */
function distance(a: string, b: string): number {
  if (a === b) return 0;
  let precedente = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const courante = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = precedente[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      courante[j] = Math.min(courante[j - 1] + 1, precedente[j] + 1, substitution);
    }
    precedente = courante;
  }

  return precedente[b.length];
}

/**
 * Rend l'adresse corrigée si le domaine saisi ressemble de très près à un
 * fournisseur courant, `null` sinon.
 *
 * Seuil de deux caractères : au-delà, ce n'est plus une faute de frappe mais
 * un autre domaine, et suggérer reviendrait à mettre en doute une adresse
 * professionnelle parfaitement valide.
 */
export function suggererAdresse(email: string): string | null {
  const arobase = email.lastIndexOf("@");
  if (arobase < 1) return null;

  const domaine = email.slice(arobase + 1).toLowerCase().trim();
  // Un domaine très court ne se compare pas utilement : trop de voisins.
  if (domaine.length < 5 || DOMAINES_COURANTS.includes(domaine)) return null;

  let meilleur: string | null = null;
  let meilleureDistance = 3;

  for (const candidat of DOMAINES_COURANTS) {
    const ecart = distance(domaine, candidat);
    if (ecart < meilleureDistance) {
      meilleureDistance = ecart;
      meilleur = candidat;
    }
  }

  return meilleur === null ? null : email.slice(0, arobase + 1) + meilleur;
}

/* ==========================================================================
   ANTI-SPAM
   Deux barrières sans cookie, sans service tiers, sans capteur biométrique :
   rien à déclarer au titre du RGPD, aucun impact sur les Core Web Vitals.
   Les deux sont vérifiées par demande.php ; ici on ne déclare que les noms.
   ========================================================================== */

/** Nom du champ piège. Plausible pour un robot, invisible pour un humain. */
export const CHAMP_PIEGE = "site_web_entreprise";

/** Nom du champ d'horodatage, renseigné par le navigateur au montage. */
export const CHAMP_INSTANT = "ouverture";
