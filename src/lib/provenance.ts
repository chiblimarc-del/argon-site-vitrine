import { findRoute } from "./routes.ts";

/**
 * D'OÙ VIENT CE PROSPECT — la question que le site ne savait pas répondre.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QUE CE FICHIER FAIT, ET CE QU'IL NE FAIT PAS
 *
 * Il permet à l'e-mail de demande de porter la page depuis laquelle le
 * visiteur a cliqué, et la source par laquelle il est arrivé sur le site.
 * Sans cela, une demande arrive sans qu'on sache jamais ce qui l'a produite :
 * toute décision éditoriale se prend alors à l'intuition, et une page qui
 * convertit trois fois mieux qu'une autre reste invisible.
 *
 * ⚠️ IL N'ÉCRIT RIEN DANS LE NAVIGATEUR. Ni cookie, ni `localStorage`, ni
 * `sessionStorage`. Le chemin précédent vit dans une VARIABLE DE MODULE :
 * elle existe tant que l'onglet garde la page chargée et disparaît au
 * rechargement, comme n'importe quelle variable JavaScript. La politique de
 * confidentialité — « ce site ne dépose aucun cookie et n'écrit rien dans la
 * mémoire de votre navigateur » — reste donc exacte au mot près. Ne pas
 * remplacer ce mécanisme par un stockage sans réécrire cette page-là.
 *
 * ⚠️ POURQUOI PAS `document.referrer` SEUL. Avec l'App Router, une navigation
 * interne ne recharge pas le document : `document.referrer` reste figé sur le
 * référent du PREMIER chargement. Un visiteur venu de Google sur
 * /secteurs/cvc puis passé au formulaire donnerait « google.com » et rien
 * d'autre — la page qui a réellement produit le clic serait perdue.
 *
 * Les deux mécanismes sont donc complémentaires, et c'est voulu :
 *   — le chemin précédent (mémoire)     → quelle PAGE a produit la demande ;
 *   — `document.referrer` (navigateur)  → par quelle SOURCE il est entré.
 *
 * ⚠️ CE QU'ON NE SAURA PAS. Seul le dernier saut est connu. Un visiteur entré
 * par Google, passé par trois pages, puis revenu deux jours plus tard donnera
 * la dernière page et « accès direct ». Le parcours entier se lit dans les
 * journaux du serveur, pas ici. Une attribution parfaite exigerait un
 * traceur ; le site a choisi de ne pas en poser.
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ==========================================================================
   MÉMOIRE DE NAVIGATION
   ========================================================================== */

let cheminCourant: string | null = null;
let cheminPrecedent: string | null = null;

/**
 * Appelé à chaque changement de route par `SuiviProvenance`, monté dans le
 * layout. Un même chemin répété (re-rendu, ancre) ne décale rien : sinon le
 * « précédent » deviendrait le courant, et la page d'origine serait toujours
 * le formulaire lui-même.
 */
export function enregistrerChemin(chemin: string): void {
  if (chemin === cheminCourant) return;
  cheminPrecedent = cheminCourant;
  cheminCourant = chemin;
}

/** Chemin de la page précédente, ou `null` si le formulaire est le point d'entrée. */
export function cheminPrecedentConnu(): string | null {
  return cheminPrecedent;
}

/** Remet la mémoire à zéro. Réservé aux tests. */
export function reinitialiserProvenance(): void {
  cheminCourant = null;
  cheminPrecedent = null;
}

/* ==========================================================================
   CONSTRUCTION DE LA PROVENANCE
   Fonction pure : mêmes entrées, même sortie, aucun accès au navigateur. Elle
   est testable telle quelle — c'est ce qui permet de vérifier les cas
   tordus (referrer interne, referrer vide, chemin inconnu du registre) sans
   ouvrir un navigateur.
   ========================================================================== */

export interface Provenance {
  /** Chemin interne de la page d'origine. Vide si inconnue. */
  url: string;
  /** Titre lisible de cette page, lu au registre. Vide si le chemin est inconnu. */
  titre: string;
  /** Hôte du site extérieur d'où vient le visiteur. Vide s'il vient d'ici. */
  source: string;
  /** Paramètres de campagne présents dans l'URL. Vide s'il n'y en a pas. */
  campagne: string;
}

export interface EntreesProvenance {
  /** Chemin retenu par la mémoire de navigation. */
  cheminPrecedent: string | null;
  /** `document.referrer`, tel quel. */
  referrer: string;
  /** Origine du site courant (`window.location.origin`). */
  origineSite: string;
  /** Paramètres de l'URL du formulaire. */
  parametres: URLSearchParams;
}

/**
 * Paramètres de campagne reconnus. Le site n'en émet aucun aujourd'hui : ils
 * sont lus pour le jour où une campagne existera, et parce qu'un lien partagé
 * peut en porter sans qu'on l'ait décidé.
 */
const CLES_CAMPAGNE = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
] as const;

/**
 * Retire le suffixe de marque du titre du registre : « Logiciel de gestion des
 * interventions CVC | Argon » devient « Logiciel de gestion des interventions
 * CVC ». L'e-mail est déjà titré « Argon », le répéter n'apprend rien.
 */
function titreLisible(titre: string): string {
  const separateur = titre.lastIndexOf(" | ");
  return separateur === -1 ? titre : titre.slice(0, separateur);
}

export function construireProvenance(entrees: EntreesProvenance): Provenance {
  const { cheminPrecedent, referrer, origineSite, parametres } = entrees;

  /**
   * La page d'origine, dans l'ordre de fiabilité :
   *   1. la mémoire de navigation — le clic vient forcément de là ;
   *   2. le referrer, s'il pointe vers une page de CE site — cas du visiteur
   *      qui ouvre le formulaire dans un nouvel onglet, ou qui recharge.
   */
  let url = cheminPrecedent ?? "";
  let source = "";

  if (referrer !== "") {
    try {
      const lien = new URL(referrer);
      const interne = origineSite !== "" && lien.origin === origineSite;

      if (interne) {
        if (url === "") url = lien.pathname;
      } else {
        source = lien.hostname;
      }
    } catch {
      // Un referrer illisible n'est pas une erreur à remonter : on n'en tire
      // simplement rien. Perdre une ligne d'information ne doit jamais coûter
      // une demande.
    }
  }

  // Le formulaire lui-même n'est pas une page d'origine : le retenir
  // reviendrait à répondre « la page du formulaire » à « quelle page a produit
  // cette demande ? ».
  if (url === "/demander-une-demo") url = "";

  const route = url === "" ? undefined : findRoute(url);

  const campagne = CLES_CAMPAGNE.map((cle) => {
    const valeur = parametres.get(cle);
    return valeur === null || valeur === "" ? null : `${cle}=${valeur}`;
  })
    .filter((entree): entree is string => entree !== null)
    .join(" ");

  return {
    url,
    titre: route ? titreLisible(route.title) : "",
    source,
    campagne,
  };
}

/* ==========================================================================
   NOMS DES CHAMPS
   Doivent rester identiques à ceux que lit `deploy/api/demande.php`.
   ========================================================================== */

export const CHAMPS_PROVENANCE = {
  url: "origine_url",
  titre: "origine_titre",
  source: "origine_source",
  campagne: "origine_campagne",
} as const;
