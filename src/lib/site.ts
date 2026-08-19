/**
 * Configuration globale du site vitrine Argon.
 *
 * Un seul endroit à modifier pour l'identité du site. L'URL de production
 * est lue depuis la variable d'environnement NEXT_PUBLIC_SITE_URL afin que
 * les environnements de preview (Vercel, OVH staging) génèrent des canonical
 * et des URLs Open Graph corrects sans changer le code.
 */

/**
 * URL absolue du site, sans slash final.
 * Priorité : variable d'environnement > domaine de production.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.argon-mobility.com"
).replace(/\/$/, "");

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OUVERTURE DU SITE AUX MOTEURS DE RECHERCHE
 *
 * Deux questions distinctes, qu'il ne faut surtout pas confondre :
 *   — QUEL DOMAINE ? → NEXT_PUBLIC_SITE_URL (canonical, sitemap, Open Graph)
 *   — OUVERT OU FERMÉ ? → NEXT_PUBLIC_SITE_OPEN (ci-dessous)
 *
 * Le site est déployé sur son domaine définitif AVANT d'être ouvert au
 * référencement : les pages légales ne sont pas prêtes, et un site
 * professionnel indexé sans mentions légales est en infraction (article 6 de
 * la LCEN). Il faut donc des canonical de production ET une fermeture totale.
 *
 * ⚠️ FERMÉ PAR DÉFAUT. L'ouverture est un acte délibéré, jamais un effet de
 * bord d'un oubli de variable. Un site fermé par erreur se rattrape en un
 * build ; un site ouvert par erreur laisse des traces dans l'index de Google
 * pendant des semaines.
 *
 * ⚠️ « Fermé » ne veut PAS dire `Disallow: /` dans robots.txt. Interdire
 * l'exploration n'empêche pas l'indexation : Google peut faire figurer dans
 * ses résultats une URL qu'il n'a jamais lue, si elle lui parvient autrement
 * (un lien, un partage, un referrer). Et comme il n'a pas le droit de lire la
 * page, il n'y verra jamais l'ordre de ne pas l'indexer. On fait donc
 * l'inverse : on AUTORISE l'exploration, et chaque réponse porte un `noindex`
 * que le robot est obligé de lire. C'est la méthode recommandée par Google
 * pour tenir une page hors de l'index.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const siteOuvertAuxMoteurs = process.env.NEXT_PUBLIC_SITE_OPEN === "true";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLÉ PUBLIQUE TURNSTILE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Turnstile est le contrôle anti-robot de Cloudflare, posé sur le formulaire
 * de demande de démonstration.
 *
 * Cette clé est PUBLIQUE par conception : Cloudflare la nomme « clé publique
 * servant à invoquer le widget », elle figure dans le code source de chaque
 * page qui l'affiche, et elle ne fonctionne que sur les domaines déclarés dans
 * le tableau de bord. La divulguer ne donne rien à personne.
 *
 * ⚠️ Elle est écrite ICI et non dans une variable d'environnement, à dessein.
 * `.env.local` est ignoré par Git : un poste qui l'oublie produirait un build
 * dépourvu de widget, expédié sans que rien ne le signale. Le contrôle
 * anti-robot ne doit pas dépendre d'un fichier que le dépôt ne transporte pas.
 *
 * La clé SECRÈTE, elle, ne vit que dans `argon-config.php` sur le serveur, aux
 * côtés des identifiants Mailjet. Elle n'est ni ici, ni nulle part dans ce
 * dépôt.
 */
export const turnstileSiteKey = "0x4AAAAAAET2H51IgcxjGM8Q";

export const site = {
  name: "Argon",
  /** Nom légal / raison sociale. À compléter quand la société sera immatriculée. */
  legalName: "",
  url: siteUrl,
  locale: "fr_FR",
  lang: "fr",
  /**
   * Description par défaut (fallback). Chaque page définit la sienne
   * dans le registre de routes.
   */
  description:
    "Argon centralise vos interventions, plannings, équipes et opérations terrain dans une seule plateforme.",
  /**
   * Coordonnées.
   *
   * Règle de vérité produit (cahier V2 §31) : on n'invente rien. Une valeur
   * absente reste une chaîne vide et les composants testent la présence avant
   * d'afficher — jamais de coordonnée de remplissage.
   *
   * ⚠️ Le type est explicitement `string` (et non le littéral déduit par
   * `as const`) : sans cela, une chaîne vide est narrowée au type `""`, la
   * branche « valeur présente » devient `never` et tout code qui manipule la
   * valeur (`.replace`, `.trim`…) casse le typecheck. Le type doit refléter
   * « peut être renseignée ou non », pas la valeur du jour.
   */
  email: "contact@argon-mobility.com" as string,
  /** Forme lisible, affichée telle quelle sur le site. */
  phone: "01 85 73 59 41" as string,
  /**
   * Même numéro au format international. Deux usages distincts :
   *   — `tel:` doit être composable depuis l'étranger, donc jamais le 0 initial ;
   *   — Schema.org attend un format international pour `telephone`.
   * Ce n'est pas une seconde donnée, c'est le même numéro autrement écrit.
   */
  phoneInternational: "+33185735941" as string,
  address: null as null | {
    streetAddress: string;
    postalCode: string;
    addressLocality: string;
    addressCountry: string;
  },
  /** Profils sociaux réels uniquement. Alimente le `sameAs` de Schema.org. */
  socials: [] as string[],
} as const;

/**
 * CTA unique et répété sur tout le site (cahier V2 : une seule intention,
 * un seul libellé principal).
 */
export const primaryCta = {
  label: "Demander une démo",
  href: "/demander-une-demo",
} as const;

export const secondaryCta = {
  label: "Découvrir Argon",
  href: "/solutions",
} as const;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACCÈS À L'APPLICATION — « Connexion client »
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * L'espace client vit dans le SaaS, sur un autre domaine. Il n'a donc RIEN à
 * faire dans `src/lib/routes.ts` : ce registre ne décrit que les pages de la
 * vitrine, celles qui ont un title, une description et une place dans le
 * sitemap. Y déclarer une URL externe casserait le sitemap et les breadcrumbs.
 *
 * ⚠️ Le lien est donc rendu par un <a> natif et NON par `NavLink` ou `Button` :
 * ces deux composants passent par `next/link`, qui préfetche et intercepte la
 * navigation — inutile et contre-productif vers un domaine tiers.
 *
 * `rel="noopener"` est posé côté composant. Le lien reste dans le même onglet :
 * un client qui se connecte quitte la vitrine, c'est le comportement attendu.
 */
export const espaceClient = {
  label: "Connexion client",
  href: "https://app.argon-mobility.com/login",
} as const;

/** Construit une URL absolue à partir d'un chemin interne. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path === "/" ? "" : path}`;
}
