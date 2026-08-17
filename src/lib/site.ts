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

/** Construit une URL absolue à partir d'un chemin interne. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path === "/" ? "" : path}`;
}
