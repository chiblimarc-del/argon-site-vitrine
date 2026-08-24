/**
 * LE MAILLAGE DES PAGES MÉTIER
 * ============================
 *
 * NOUVEAU AU LOT 7.
 *
 * ─── LES DEUX DÉFAUTS ─────────────────────────────────────────
 *
 * 1. LA MONOTONIE. Les cinq pages métier renvoyaient au MÊME triplet de
 *    solutions, dans un ordre à peine différent. Un maillage identique sur
 *    cinq pages dit à Google et au visiteur la même chose : ces pages sont
 *    interchangeables.
 *
 * 2. LE MAILLAGE CONTREDISAIT LE CONTENU. Les cinq pages parlent toutes de
 *    mobile et de compte rendu — aucune ne liait `application-mobile-technicien`,
 *    `rapports-intervention` ni `transfert-comptable`. Et AUCUNE page métier ne
 *    pointait vers `/secteurs/transport-courses` : ce métier recevait zéro lien
 *    latéral.
 *
 * ─── LA RÈGLE ─────────────────────────────────────────────────
 *
 * Chaque métier pointe vers les briques qu'IL utilise, dans l'ordre où il les
 * rencontre. Un lien doit être justifiable par une phrase de la page qui
 * l'émet — sinon c'est un lien creux, et un lien creux coûte plus qu'un lien
 * absent.
 *
 * ⚠️ COUVERTURE VÉRIFIÉE : les sept pages solution reçoivent chacune au moins
 * un lien entrant depuis une page métier, et les cinq métiers reçoivent chacun
 * au moins un lien latéral. Ne pas modifier une ligne sans revérifier les deux.
 *
 * ⚠️ LE MOTIF, PAS SEULEMENT LA CIBLE. Le champ `parce_que` n'est pas de la
 * documentation : il se rend à l'écran, sous le lien. Un visiteur qui sait
 * pourquoi on l'envoie ailleurs y va ; un « en savoir plus » ne convainc
 * personne.
 */

export type LienMaillage = {
  path: string;
  /** Rendu sous le lien. Doit renvoyer à une phrase de la page émettrice. */
  parce_que: string;
};

export type MaillageMetier = {
  /** Les briques que ce métier utilise, dans l'ordre où il les rencontre. */
  solutions: readonly LienMaillage[];
  /** Les métiers voisins. Assure qu'aucun ne reste sans lien entrant. */
  lateraux: readonly LienMaillage[];
};

export const MAILLAGE_METIERS: Record<string, MaillageMetier> = {
  "/secteurs/maintenance": {
    solutions: [
      {
        path: "/solutions/gestion-interventions",
        parce_que:
          "Tout ce qui a été fait sur un site reste attaché au site, pas au technicien qui l'a fait.",
      },
      {
        path: "/solutions/rapports-intervention",
        parce_que:
          "C'est le compte rendu qui constitue la mémoire du site, visite après visite.",
      },
      {
        path: "/solutions/devis-facturation",
        parce_que:
          "Une intervention sous contrat et un devis hors contrat ne se facturent pas pareil.",
      },
    ],
    lateraux: [
      {
        path: "/secteurs/cvc",
        parce_que: "Si votre contrat couvre aussi le chaud et le froid.",
      },
      {
        /* ⚠️ SEUL LIEN ENTRANT VERS INSTALLATION. Ne pas le retirer sans le
           replacer ailleurs : sans lui, cette page ne reçoit aucun lien
           latéral, ce qui était exactement le défaut relevé à l'audit du
           20/08 pour transport-courses. Le motif est solide — un site sous
           contrat a d'abord été installé. */
        path: "/secteurs/installation",
        parce_que:
          "Un site que vous entretenez a d'abord été posé. Les deux se suivent dans le même dossier.",
      },
    ],
  },

  "/secteurs/depannage": {
    solutions: [
      {
        path: "/solutions/planning-interventions",
        parce_que:
          "Voir la charge, c'est pouvoir répondre au client pendant qu'il est encore au téléphone.",
      },
      {
        path: "/solutions/application-mobile-technicien",
        parce_que:
          "Le technicien détourné en urgence doit trouver le contexte sur place, pas vous appeler.",
      },
      {
        path: "/solutions/gestion-interventions",
        parce_que:
          "Une urgence reste une intervention : elle se contrôle et se facture comme les autres.",
      },
    ],
    lateraux: [
      {
        path: "/secteurs/transport-courses",
        parce_que: "Si vos urgences comprennent aussi des courses à assurer.",
      },
    ],
  },

  "/secteurs/installation": {
    solutions: [
      {
        path: "/solutions/rapports-intervention",
        parce_que:
          "Ce qui a été fait doit pouvoir se montrer trois mois plus tard, photos et signature comprises.",
      },
      {
        path: "/solutions/devis-facturation",
        parce_que:
          "Un chantier se devise, se réalise, puis se facture — et le supplément se justifie en chemin.",
      },
      {
        path: "/solutions/transfert-comptable",
        parce_que:
          "Sur des montants de chantier, ce que reçoit le cabinet doit être exact du premier coup.",
      },
    ],
    lateraux: [
      {
        path: "/secteurs/maintenance",
        parce_que: "Si vous entretenez ensuite ce que vous avez installé.",
      },
    ],
  },

  "/secteurs/transport-courses": {
    solutions: [
      {
        path: "/solutions/planning-interventions",
        parce_que:
          "Une journée de courses se réorganise plusieurs fois avant midi.",
      },
      {
        path: "/solutions/devis-facturation",
        parce_que:
          "Chez un donneur d'ordre, une facture sans numéro de bon de commande revient.",
      },
      {
        path: "/solutions/heures-et-absences",
        parce_que:
          "Les heures et les kilomètres du conducteur se relèvent avec la course, pas après.",
      },
    ],
    lateraux: [
      {
        path: "/secteurs/depannage",
        parce_que: "Si une partie de vos courses part en urgence.",
      },
    ],
  },

  "/secteurs/cvc": {
    solutions: [
      {
        path: "/solutions/planning-interventions",
        parce_que:
          "C'est là que se tranche le conflit entre la visite due et l'urgence du jour.",
      },
      {
        path: "/solutions/heures-et-absences",
        parce_que:
          "Une saison haute à effectif constant se paie en heures. Autant les voir venir.",
      },
      {
        path: "/solutions/gestion-interventions",
        parce_que:
          "Une visite contractuelle et un dépannage suivent le même cycle, avec des enjeux différents.",
      },
    ],
    lateraux: [
      {
        path: "/secteurs/maintenance",
        parce_que: "Pour la partie contractuelle, hors saison.",
      },
      {
        path: "/secteurs/depannage",
        parce_que: "Pour la partie urgence, en pleine saison.",
      },
    ],
  },
};

/**
 * Les chemins d'un métier, solutions puis latéraux, dans l'ordre de lecture.
 * Rend inutile toute liste de chemins écrite en dur dans une page.
 */
export const cheminsDe = (path: string): string[] => {
  const m = MAILLAGE_METIERS[path];
  if (!m) return [];
  return [...m.solutions, ...m.lateraux].map((l) => l.path);
};

/**
 * Les motifs, indexés par chemin cible.
 * ⚠️ C'est CE champ qui distingue ce maillage de l'ancien : le pitch du
 * registre décrit la page d'arrivée pour tout le monde ; le motif dit
 * pourquoi ce lien-là depuis CE métier-là. Un « en savoir plus » ne
 * convainc personne.
 */
export const motifsDe = (path: string): Record<string, string> => {
  const m = MAILLAGE_METIERS[path];
  if (!m) return {};
  return Object.fromEntries(
    [...m.solutions, ...m.lateraux].map((l) => [l.path, l.parce_que]),
  );
};

export const maillageDe = (path: string): MaillageMetier | undefined =>
  MAILLAGE_METIERS[path];
