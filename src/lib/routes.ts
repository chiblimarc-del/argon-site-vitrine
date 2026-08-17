/**
 * REGISTRE CENTRAL DES ROUTES — source de vérité SEO du site.
 *
 * Ce fichier est la traduction exécutable du « Cahier de construction &
 * stratégie SEO V2 ». Tout en découle : navigation, breadcrumbs, sitemap,
 * balises <title>, meta descriptions, canonical et données structurées.
 *
 * RÈGLES
 * 1. Une intention = une seule route. Deux routes ne peuvent pas partager
 *    le même `keyword` (vérifié par `npm run seo:check`).
 * 2. `published: false` => la page n'existe pas encore. Elle est exclue du
 *    sitemap et affichée comme non cliquable dans la navigation. On bascule
 *    à `true` le jour où la page est réellement construite.
 * 3. `keyword: null` => page navigationnelle, sans ambition de positionnement
 *    (hubs /solutions et /secteurs, pages légales, conversion).
 * 4. Les `title` sont plafonnés à 60 caractères et les `description` à 160,
 *    au-delà Google tronque ou réécrit.
 *
 * Décisions appliquées après audit V1 (architecture V3) :
 * - `/` porte « logiciel de gestion des interventions terrain ». Ce terme est
 *   retiré des secondaires de /solutions/gestion-interventions.
 * - `/solutions` et `/secteurs` sont des hubs P3 sans mot-clé propre.
 * - `/secteurs/cvc` cible « logiciel gestion interventions CVC »
 *   (et non « maintenance climatisation », qui cannibaliserait /maintenance).
 * - `/ressources` n'est pas déclarée tant qu'aucun contenu réel n'existe.
 * - SUPPRIMÉE `/solutions/suivi-terrain` : intention quasi identique à
 *   gestion-interventions, repliée dedans.
 * - SUPPRIMÉE `/fonctionnalites` : fourre-tout qui concurrençait chaque page
 *   solution sur ses propres secondaires, pour une requête inexistante. Le hub
 *   /solutions assure désormais la vue d'ensemble fonctionnelle.
 * - CRÉÉE `/solutions/devis-facturation` : une seule page pour le pont
 *   devis → facture. Deux pages (CRM d'un côté, facturation de l'autre) se
 *   seraient disputé « logiciel devis facture », la requête à valeur. « CRM »
 *   n'est PAS une tête : cette requête mène à Sellsy, Axonaut et HubSpot, sur
 *   une audience qui n'est pas la nôtre. On ne scindera que si Search Console
 *   révèle deux grappes distinctes.
 * - RENOMMÉES : application-mobile-terrain → application-mobile-technicien
 *   (« technicien » est dans la requête observée) ; transport-leger →
 *   transport-courses (« courses » est le mot-clé cible). Aucune de ces URLs
 *   n'ayant été publiée, aucune redirection n'est nécessaire.
 */

export type Priority = "P0" | "P1" | "P2" | "P3";

export type RouteGroup =
  | "accueil"
  | "solutions"
  | "secteurs"
  | "produit"
  | "conversion"
  | "entreprise"
  | "legal"
  | "systeme";

export interface RouteDef {
  /** Chemin interne, sans slash final (sauf la racine). */
  path: string;
  /** Libellé court utilisé dans la navigation et les breadcrumbs. */
  label: string;
  /** Balise <title> complète, marque incluse. 60 caractères maximum. */
  title: string;
  /** Meta description. 160 caractères maximum. */
  description: string;
  /** H1 de la page. Unique sur tout le site. */
  h1: string;
  /** Mot-clé principal. `null` pour une page sans ambition de positionnement. */
  keyword: string | null;
  /** Mots-clés secondaires, à usage rédactionnel. Jamais de bourrage. */
  secondaryKeywords: string[];
  /** Priorité business, reprise de la matrice V2. */
  priority: Priority;
  /** La page est-elle réellement construite et publiable ? */
  published: boolean;
  /** Autorise-t-on l'indexation ? */
  indexable: boolean;
  /** Route parente, pour les breadcrumbs. `null` pour la racine. */
  parent: string | null;
  /** Priorité sitemap (0 à 1). */
  sitemapPriority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  group: RouteGroup;
  /** Pitch court réutilisé dans les cartes de navigation et les hubs. */
  pitch?: string;
}

/* ==========================================================================
   ACCUEIL
   ========================================================================== */

const accueil: RouteDef[] = [
  {
    path: "/",
    label: "Accueil",
    title: "Logiciel de gestion des interventions terrain | Argon",
    description:
      "Centralisez vos interventions, plannings et équipes dans une seule plateforme. Argon pilote l'activité terrain des entreprises d'intervention et de transport.",
    h1: "Pilotez vos opérations terrain depuis une seule plateforme.",
    keyword: "logiciel gestion interventions terrain",
    secondaryKeywords: [
      "logiciel intervention terrain",
      "gestion opérations terrain",
      "logiciel équipes terrain",
      "planning interventions",
      "suivi interventions",
      "logiciel techniciens",
      "gestion missions",
    ],
    priority: "P0",
    published: true,
    indexable: true,
    parent: null,
    sitemapPriority: 1,
    changeFrequency: "monthly",
    group: "accueil",
  },
];

/* ==========================================================================
   AXE FONCTIONNEL — SOLUTIONS
   Le hub est navigationnel (P3). Seules les pages filles portent une intention.
   ========================================================================== */

const solutions: RouteDef[] = [
  {
    path: "/solutions",
    label: "Solutions",
    title: "Solutions de pilotage terrain | Argon",
    description:
      "Interventions, planning, devis et facturation, application mobile, comptes rendus : découvrez les briques de la plateforme Argon.",
    h1: "Une plateforme pour piloter vos opérations de bout en bout.",
    keyword: null, // hub navigationnel — aucune ambition de positionnement
    secondaryKeywords: [],
    priority: "P3",
    published: false,
    indexable: true,
    parent: "/",
    sitemapPriority: 0.4,
    changeFrequency: "monthly",
    group: "solutions",
    pitch: "Toutes les briques fonctionnelles d'Argon.",
  },
  {
    path: "/solutions/gestion-interventions",
    label: "Gestion des interventions",
    title: "Logiciel de gestion des interventions | Argon",
    description:
      "Planifiez, affectez et suivez vos interventions depuis une seule plateforme. Argon centralise missions, équipes, comptes rendus et suivi terrain.",
    h1: "Gérez vos interventions de la demande au compte rendu.",
    keyword: "logiciel gestion des interventions",
    // « logiciel gestion interventions terrain » a été RETIRÉ : c'est le
    // mot-clé principal de l'accueil. Le laisser ici entretenait la seule
    // cannibalisation résiduelle du site.
    secondaryKeywords: [
      "gestion intervention",
      "suivi interventions",
      "logiciel suivi interventions",
      "gestion missions terrain",
      "cycle de vie intervention",
    ],
    priority: "P0",
    published: false,
    indexable: true,
    parent: "/solutions",
    sitemapPriority: 0.9,
    changeFrequency: "monthly",
    group: "solutions",
    pitch: "De la demande client jusqu'au compte rendu signé.",
  },
  {
    path: "/solutions/planning-interventions",
    label: "Planning",
    title: "Logiciel planning interventions | Argon",
    description:
      "Organisez le planning de vos techniciens et équipes terrain : affectation des missions, visibilité des disponibilités et arbitrage des priorités.",
    h1: "Planifiez vos équipes sans perdre la maîtrise du terrain.",
    keyword: "logiciel planning interventions",
    secondaryKeywords: [
      "planning interventions",
      "planning techniciens",
      "logiciel planning techniciens",
      "planification interventions",
      "planning équipes terrain",
    ],
    priority: "P0",
    published: false,
    indexable: true,
    parent: "/solutions",
    sitemapPriority: 0.9,
    changeFrequency: "monthly",
    group: "solutions",
    pitch: "Affectez, arbitrez et visualisez la charge de vos équipes.",
  },
  {
    path: "/solutions/devis-facturation",
    label: "Devis & facturation",
    title: "Logiciel de devis et facturation d'interventions | Argon",
    description:
      "Établissez vos devis, relancez ceux restés sans réponse et facturez les interventions réalisées, depuis la même fiche client.",
    h1: "Du devis à la facture, sans ressaisir une ligne.",
    // Le pont que personne ne couvre : les logiciels d'intervention s'arrêtent
    // au compte rendu, les outils de devis ne voient pas le terrain.
    keyword: "logiciel devis facture intervention",
    secondaryKeywords: [
      "logiciel devis intervention",
      "logiciel facturation intervention",
      "devis et facture",
      "relance devis",
      "fiche client intervention",
    ],
    priority: "P0",
    published: false,
    indexable: true,
    parent: "/solutions",
    sitemapPriority: 0.9,
    changeFrequency: "monthly",
    group: "solutions",
    pitch: "Devis, relances et factures rattachés au client.",
  },
  {
    path: "/solutions/application-mobile-technicien",
    label: "Application mobile",
    title: "Application mobile pour techniciens terrain | Argon",
    description:
      "Vos équipes reçoivent leurs missions, consultent les informations client et remontent leurs comptes rendus directement depuis leur mobile.",
    h1: "Donnez à vos équipes terrain les bonnes informations au bon moment.",
    keyword: "application mobile technicien terrain",
    secondaryKeywords: [
      "application intervention terrain",
      "application technicien",
      "application gestion interventions",
      "logiciel technicien terrain",
      "application suivi intervention",
    ],
    priority: "P1",
    published: false,
    indexable: true,
    parent: "/solutions",
    sitemapPriority: 0.8,
    changeFrequency: "monthly",
    group: "solutions",
    pitch: "La bonne information, au bon moment, sur le mobile.",
  },
  {
    path: "/solutions/rapports-intervention",
    label: "Rapports d'intervention",
    title: "Rapport d'intervention digital | Argon",
    description:
      "Digitalisez vos rapports d'intervention et centralisez les informations, photos et observations remontées depuis le terrain, sans ressaisie.",
    h1: "Du terrain au compte rendu sans ressaisie.",
    keyword: "rapport d'intervention",
    secondaryKeywords: [
      "rapport intervention digital",
      "compte rendu intervention",
      "compte rendu technicien",
      "rapport intervention terrain",
    ],
    priority: "P1",
    published: false,
    indexable: true,
    parent: "/solutions",
    sitemapPriority: 0.8,
    changeFrequency: "monthly",
    group: "solutions",
    pitch: "Comptes rendus, photos et historique centralisés.",
  },
];

/* ==========================================================================
   AXE MÉTIERS — SECTEURS
   Le hub est navigationnel (P3). « Intervention terrain » n'est pas un métier
   et n'apparaît donc pas ici (cahier V2 §3).
   ========================================================================== */

const secteurs: RouteDef[] = [
  {
    path: "/secteurs",
    label: "Secteurs",
    title: "Logiciel de gestion terrain par métier | Argon",
    description:
      "Maintenance, dépannage, installation, transport léger, CVC : découvrez comment Argon s'adapte au vocabulaire et aux contraintes de chaque métier.",
    h1: "Une plateforme adaptée aux entreprises qui travaillent sur le terrain.",
    keyword: null, // hub navigationnel
    secondaryKeywords: [],
    priority: "P3",
    published: false,
    indexable: true,
    parent: "/",
    sitemapPriority: 0.4,
    changeFrequency: "monthly",
    group: "secteurs",
    pitch: "Argon vu par chaque métier du terrain.",
  },
  {
    path: "/secteurs/maintenance",
    label: "Maintenance",
    title: "Logiciel de gestion de maintenance | Argon",
    description:
      "Argon aide les entreprises de maintenance à planifier leurs interventions, organiser leurs techniciens et suivre leur activité terrain.",
    h1: "Pilotez vos opérations de maintenance avec une vision claire du terrain.",
    keyword: "logiciel gestion maintenance",
    secondaryKeywords: [
      "logiciel maintenance",
      "gestion interventions maintenance",
      "logiciel maintenance techniciens",
      "suivi maintenance",
      "planning maintenance",
    ],
    priority: "P0",
    published: false,
    indexable: true,
    parent: "/secteurs",
    sitemapPriority: 0.9,
    changeFrequency: "monthly",
    group: "secteurs",
    pitch: "Planifiez les interventions et suivez vos équipes de maintenance.",
  },
  {
    path: "/secteurs/depannage",
    label: "Dépannage",
    title: "Logiciel de gestion du dépannage | Argon",
    description:
      "Centralisez les demandes de dépannage, affectez vos équipes disponibles et suivez chaque intervention urgente jusqu'à sa clôture.",
    h1: "Réagissez rapidement et gardez le contrôle de chaque intervention.",
    keyword: "logiciel gestion dépannage",
    secondaryKeywords: [
      "logiciel dépannage",
      "gestion interventions dépannage",
      "planning dépannage",
      "intervention urgente",
      "techniciens dépannage",
    ],
    priority: "P1",
    published: false,
    indexable: true,
    parent: "/secteurs",
    sitemapPriority: 0.8,
    changeFrequency: "monthly",
    group: "secteurs",
    pitch: "Réagissez vite et pilotez les interventions urgentes.",
  },
  {
    path: "/secteurs/installation",
    label: "Installation",
    title: "Logiciel de gestion des installations | Argon",
    description:
      "Planifiez vos chantiers d'installation, affectez vos équipes et suivez chaque opération jusqu'à sa réalisation et sa preuve de réalisation.",
    h1: "Coordonnez vos installations du planning à la réalisation.",
    keyword: "logiciel gestion installation",
    secondaryKeywords: [
      "logiciel gestion installations",
      "planning installation",
      "suivi installation",
      "intervention installation",
      "techniciens installation",
    ],
    priority: "P1",
    published: false,
    indexable: true,
    parent: "/secteurs",
    sitemapPriority: 0.8,
    changeFrequency: "monthly",
    group: "secteurs",
    pitch: "Coordonnez les équipes et suivez chaque installation.",
  },
  {
    path: "/secteurs/transport-courses",
    label: "Transport léger",
    title: "Logiciel de gestion des courses et tournées | Argon",
    description:
      "Organisez vos courses, tournées et équipes terrain avec Argon. Planification, suivi des missions et activité transport dans une seule plateforme.",
    h1: "Pilotez vos courses et tournées depuis une seule plateforme.",
    keyword: "logiciel gestion courses",
    secondaryKeywords: [
      "logiciel coursier",
      "logiciel transport léger",
      "gestion tournées",
      "logiciel gestion tournées",
      "planning tournées",
      "suivi courses",
      "gestion chauffeurs",
      "gestion livraisons",
    ],
    priority: "P0",
    published: false,
    indexable: true,
    parent: "/secteurs",
    sitemapPriority: 0.9,
    changeFrequency: "monthly",
    group: "secteurs",
    pitch: "Courses, tournées, conducteurs et suivi des livraisons.",
  },
  {
    path: "/secteurs/cvc",
    label: "CVC",
    title: "Logiciel de gestion des interventions CVC | Argon",
    description:
      "Argon aide les entreprises de chauffage, ventilation et climatisation à organiser leurs interventions, leurs techniciens et leur suivi terrain.",
    h1: "Simplifiez la gestion de vos interventions CVC.",
    // Corrigé après audit : ne cible plus « logiciel gestion maintenance
    // climatisation », dont la tête cannibaliserait /secteurs/maintenance.
    keyword: "logiciel gestion interventions CVC",
    secondaryKeywords: [
      "logiciel entreprise climatisation",
      "logiciel technicien climatisation",
      "planning techniciens climatisation",
      "gestion interventions climatisation",
      "logiciel chauffage climatisation",
    ],
    priority: "P1",
    // À CONFIRMER COMMERCIALEMENT avant publication (cahier V2 §19).
    published: false,
    indexable: true,
    parent: "/secteurs",
    sitemapPriority: 0.8,
    changeFrequency: "monthly",
    group: "secteurs",
    pitch: "Interventions, contrats et techniciens du CVC.",
  },
];

/* ==========================================================================
   PRODUIT, CONVERSION, ENTREPRISE
   ========================================================================== */

const autres: RouteDef[] = [
  {
    path: "/demander-une-demo",
    label: "Demander une démo",
    title: "Demander une démo Argon",
    description:
      "Échangez avec notre équipe et découvrez Argon appliqué à votre activité terrain. Démonstration personnalisée, sans engagement.",
    h1: "Découvrez Argon en action.",
    keyword: null, // page de conversion, pas d'ambition de trafic organique
    secondaryKeywords: [],
    priority: "P0",
    published: false,
    indexable: true,
    parent: "/",
    sitemapPriority: 0.7,
    changeFrequency: "yearly",
    group: "conversion",
  },
  {
    path: "/a-propos",
    label: "À propos",
    title: "À propos d'Argon",
    description:
      "Pourquoi Argon existe, quel problème la plateforme adresse et quelle est notre approche produit pour les équipes qui travaillent sur le terrain.",
    h1: "Construire un meilleur outil pour les équipes terrain.",
    keyword: null,
    secondaryKeywords: [],
    priority: "P2",
    published: false,
    indexable: true,
    parent: "/",
    sitemapPriority: 0.4,
    changeFrequency: "yearly",
    group: "entreprise",
  },
  {
    path: "/contact",
    label: "Contact",
    title: "Contact | Argon",
    description:
      "Une question sur Argon ou sur votre organisation terrain ? Écrivez-nous, notre équipe vous répond.",
    h1: "Parlons de votre activité terrain.",
    keyword: null,
    secondaryKeywords: [],
    priority: "P3",
    published: false,
    indexable: true,
    parent: "/",
    sitemapPriority: 0.3,
    changeFrequency: "yearly",
    group: "entreprise",
  },
];

/* ==========================================================================
   PAGES LÉGALES
   Obligatoires en France : mentions légales pour tout site professionnel,
   politique de confidentialité dès lors que le formulaire de démo collecte
   des données personnelles (RGPD).
   Le contenu n'est PAS rédigé ici : il dépend de la forme juridique, du SIREN,
   de l'hébergeur et des traitements réellement mis en œuvre.
   ========================================================================== */

const legal: RouteDef[] = [
  {
    path: "/mentions-legales",
    label: "Mentions légales",
    title: "Mentions légales | Argon",
    description:
      "Éditeur du site, hébergeur et informations légales relatives au site Argon.",
    h1: "Mentions légales",
    keyword: null,
    secondaryKeywords: [],
    priority: "P3",
    published: false,
    indexable: true,
    parent: "/",
    sitemapPriority: 0.1,
    changeFrequency: "yearly",
    group: "legal",
  },
  {
    path: "/politique-de-confidentialite",
    label: "Politique de confidentialité",
    title: "Politique de confidentialité | Argon",
    description:
      "Données collectées, finalités, durées de conservation et exercice de vos droits sur le site Argon.",
    h1: "Politique de confidentialité",
    keyword: null,
    secondaryKeywords: [],
    priority: "P3",
    published: false,
    indexable: true,
    parent: "/",
    sitemapPriority: 0.1,
    changeFrequency: "yearly",
    group: "legal",
  },
];

/* ==========================================================================
   AGRÉGATION ET HELPERS
   ========================================================================== */

export const routes: RouteDef[] = [
  ...accueil,
  ...solutions,
  ...secteurs,
  ...autres,
  ...legal,
];

/** Index par chemin, pour un accès direct. */
const routeMap = new Map(routes.map((r) => [r.path, r]));

/** Récupère une route. Lève une erreur si le chemin n'est pas déclaré. */
export function getRoute(path: string): RouteDef {
  const route = routeMap.get(path);
  if (!route) {
    throw new Error(
      `Route « ${path} » absente du registre. Déclarez-la dans src/lib/routes.ts avant de créer la page.`,
    );
  }
  return route;
}

/** Version non bloquante, pour les composants de navigation. */
export function findRoute(path: string): RouteDef | undefined {
  return routeMap.get(path);
}

/** Routes réellement construites et indexables — alimente le sitemap. */
export function publishedRoutes(): RouteDef[] {
  return routes.filter((r) => r.published && r.indexable);
}

/** Enfants directs d'une route, dans l'ordre de déclaration. */
export function childrenOf(path: string): RouteDef[] {
  return routes.filter((r) => r.parent === path);
}

/** Fil d'Ariane, de la racine jusqu'à la page courante incluse. */
export function breadcrumbsFor(path: string): RouteDef[] {
  const trail: RouteDef[] = [];
  let current = findRoute(path);
  while (current) {
    trail.unshift(current);
    current = current.parent ? findRoute(current.parent) : undefined;
  }
  return trail;
}

/** Les 5 solutions (hub exclu), pour la navigation et le maillage. */
export const solutionRoutes = childrenOf("/solutions");

/** Les 5 métiers (hub exclu), pour la navigation et le maillage. */
export const secteurRoutes = childrenOf("/secteurs");

/** Pages légales, pour le pied de page. */
export const legalRoutes = legal;
