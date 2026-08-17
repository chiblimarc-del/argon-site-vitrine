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
   ANTI-SPAM
   Deux barrières sans cookie, sans service tiers, sans capteur biométrique :
   rien à déclarer au titre du RGPD, aucun impact sur les Core Web Vitals.
   Les deux sont vérifiées par demande.php ; ici on ne déclare que les noms.
   ========================================================================== */

/** Nom du champ piège. Plausible pour un robot, invisible pour un humain. */
export const CHAMP_PIEGE = "site_web_entreprise";

/** Nom du champ d'horodatage, renseigné par le navigateur au montage. */
export const CHAMP_INSTANT = "ouverture";
