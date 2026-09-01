/**
 * SOURCE UNIQUE DE LA TARIFICATION
 * ================================
 *
 * Les cartes, les deux simulateurs, le comparatif et le JSON-LD `Offer`
 * lisent TOUS ce fichier. Aucun prix n'est recopié dans un composant.
 *
 * C'est la même logique que `routes.ts` pour les pages : une seule source,
 * et le prix affiché ne peut pas diverger du prix balisé pour Google.
 *
 * Le jour où la facturation Super Admin devient la source de vérité, seul
 * ce fichier change — les composants lisent la même forme.
 */

/* ────────────────────────────────────────────────────────────────
   1. LES TROIS OFFRES
   ──────────────────────────────────────────────────────────────── */

export type IdPlan = "essentiel" | "business" | "enterprise";

export type Plan = {
  id: IdPlan;
  libelle: string;
  /** Le verbe qui résume l'offre : Gérer · Optimiser · Orchestrer */
  verbe: string;
  /** Abonnement plateforme, en euros HT par mois */
  plateforme: number;
  /** Utilisateur terrain actif, en euros HT par mois */
  terrain: number;
  promesse: string;
  cta: string;
  recommande?: true;
};

/**
 * Tuple de longueur trois, délibérément.
 * Une quatrième offre ne doit pas pouvoir s'ajouter par distraction :
 * elle doit exiger de toucher ce type. Même principe que `TroisPreuves`.
 */
export type TroisOffres = readonly [Plan, Plan, Plan];

export const PLANS: TroisOffres = [
  {
    id: "essentiel",
    libelle: "Essentiel",
    verbe: "Gérer",
    plateforme: 149,
    terrain: 19,
    promesse: "Pour centraliser et gérer votre activité au quotidien.",
    cta: "Commencer avec Argon",
  },
  {
    id: "business",
    libelle: "Business",
    verbe: "Optimiser",
    plateforme: 249,
    terrain: 17,
    promesse: "Pour piloter plusieurs sites, consolider et garder la main sur l'ensemble.",
    cta: "Choisir Business",
    recommande: true,
  },
  {
    id: "enterprise",
    libelle: "Enterprise",
    verbe: "Orchestrer",
    plateforme: 499,
    terrain: 15,
    promesse: "Pour piloter une organisation multi-équipe, multi-site ou fortement intégrée.",
    cta: "Parler à un expert",
  },
] as const;

export const PLAN_PAR_DEFAUT: IdPlan = "business";

export const planParId = (id: IdPlan): Plan =>
  PLANS.find((p) => p.id === id) ?? PLANS[1];

/** prix plateforme + terrains × prix terrain */
/**
 * Remise consentie au règlement annuel, en %.
 * ⚠️ Elle porte sur la part PLATEFORME uniquement. Les utilisateurs
 * terrain restent au tarif plein — arbitré par le dirigeant le 24/08/2026.
 * Ne jamais l'appliquer à `plan.terrain`.
 */
export const REDUCTION_ANNUELLE = 10;

export const prixMensuel = (plan: Plan, terrains: number): number =>
  plan.plateforme + Math.max(0, terrains) * plan.terrain;

export const prixAnnuel = (plan: Plan, terrains: number): number =>
  prixMensuel(plan, terrains) * 12;

/**
 * Prix annuel réglé en une fois.
 * ⚠️ La remise porte sur la part PLATEFORME uniquement. Les utilisateurs
 * terrain sont à tarif plein — arbitré par le dirigeant le 24/08/2026.
 * C'est la seule fonction autorisée à appliquer REDUCTION_ANNUELLE.
 */
export const prixAnnuelRegleDavance = (plan: Plan, terrains: number): number =>
  plan.plateforme * 12 * (1 - REDUCTION_ANNUELLE / 100) +
  terrains * plan.terrain * 12;

/** Ce que le règlement annuel fait gagner, en euros sur l'année. */
export const economieAnnuelle = (plan: Plan): number =>
  plan.plateforme * 12 * (REDUCTION_ANNUELLE / 100);

/**
 * Le point de bascule entre deux offres : le nombre d'utilisateurs terrain
 * à partir duquel l'offre supérieure coûte MOINS cher que l'inférieure.
 *
 * Ce n'est pas un argument fabriqué, c'est une conséquence arithmétique des
 * prix affichés. Le dire avant que le client ne le découvre est cohérent avec
 * un site qui écrit déjà « ou si ce n'est pas le bon outil ».
 *
 * Rend `null` si les droites ne se croisent jamais.
 */
export const pointDeBascule = (bas: Plan, haut: Plan): number | null => {
  const ecartTerrain = bas.terrain - haut.terrain;
  if (ecartTerrain <= 0) return null;
  const ecartPlateforme = haut.plateforme - bas.plateforme;
  return Math.ceil(ecartPlateforme / ecartTerrain);
};

/* ────────────────────────────────────────────────────────────────
   2. CE QUI CONDITIONNE LA FACTURE
   ──────────────────────────────────────────────────────────────── */

export const REGLES_FACTURATION = [
  "Les utilisateurs bureau sont inclus, sans limite de nombre.",
  "Seuls les utilisateurs terrain actifs sont facturés.",
  "Un utilisateur terrain devient facturable le jour où son compte est créé et où son profil est chargé sur un téléphone. Tant que ce chargement n'a pas eu lieu, il ne l'est pas.",
  "Un utilisateur terrain suspendu ou archivé n'est pas facturé.",
  "Le nombre d'utilisateurs terrain ne déclenche aucun changement de forfait : vous choisissez votre offre selon les fonctions et le niveau de pilotage dont vous avez besoin.",
] as const;

/* ────────────────────────────────────────────────────────────────
   2 bis. ENGAGEMENT ET PAIEMENT
   ⚠️ ENGAGEMENTS CONTRACTUELS. Chaque ligne d'ici est opposable.
   Ne jamais modifier sans décision du dirigeant.
   ⚠️ Le terme « sans engagement » est INTERDIT sur tout le site.
   Il l'est d'autant plus ici qu'il serait faux : l'engagement est de 12 mois.
   ──────────────────────────────────────────────────────────────── */

export const ENGAGEMENT = [
  {
    libelle: "Abonnement mensuel",
    detail:
      "La période facturée est de 30 jours. Le mois entamé est facturé en entier.",
  },
  {
    libelle: "Engagement de 12 mois",
    detail:
      "Reconduit d'année en année à la date anniversaire, sauf préavis.",
  },
  {
    libelle: "Préavis d'un mois",
    detail:
      "Vous prévenez un mois avant la date anniversaire, et l'abonnement s'arrête à cette date.",
  },
] as const;

export const PAIEMENT = [
  {
    libelle: "Première échéance",
    detail: "Par carte, au moment de la mise en service.",
  },
  {
    libelle: "Ensuite",
    detail: "Par prélèvement mensuel.",
  },
  {
    libelle: "Ou à l'année",
    detail: `Réglé en une fois, l'abonnement plateforme est réduit de ${REDUCTION_ANNUELLE} %. Les utilisateurs terrain restent au tarif plein.`,
  },
] as const;

/* ────────────────────────────────────────────────────────────────
   3. LE SOCLE COMMUN — présent dans les trois offres
   ──────────────────────────────────────────────────────────────── */

export type DomaineSocle = {
  domaine: string;
  /** Le bénéfice, pas l'étiquette. Règle éditoriale, étape 1. */
  benefice: string;
  fonctions: readonly string[];
  /** Page du site qui développe le sujet, si elle existe. */
  lien?: string;
};

export const SOCLE: readonly DomaineSocle[] = [
  {
    domaine: "Commercial",
    benefice: "Une demande entre une fois et devient un devis sans être retapée.",
    fonctions: ["CRM", "Clients", "Contacts", "Demandes", "Devis"],
    lien: "/solutions/devis-facturation",
  },
  {
    domaine: "Opérations",
    benefice: "Ce qui est planifié, ce qui est fait et ce qui est prouvé sont la même information.",
    fonctions: [
      "Planning",
      "Interventions",
      "Application terrain",
      "Comptes rendus",
      "Photos et pièces jointes",
      "Signature",
    ],
    lien: "/solutions/gestion-interventions",
  },
  {
    domaine: "Équipes",
    benefice: "Une absence saisie une fois. Le planning et les heures suivent.",
    fonctions: ["Utilisateurs", "Heures et pointage", "Absences", "Notifications push"],
    lien: "/solutions/heures-et-absences",
  },
  {
    domaine: "Finance",
    benefice: "Rien ne part en facturation sans avoir été contrôlé, et rien de facturé ne s'oublie.",
    fonctions: ["Facturation", "Relances", "Gestion des dépenses", "Transfert comptable"],
    lien: "/solutions/transfert-comptable",
  },
  {
    domaine: "Parc",
    benefice: "Les véhicules et le matériel se suivent là où ils servent.",
    fonctions: ["Suivi de flotte", "Suivi du matériel"],
  },
  {
    domaine: "Pilotage",
    benefice: "Vous voyez où ça s'accumule avant que ce soit un problème.",
    fonctions: [
      "KPI",
      "Tableaux de bord standards",
      "Indicateurs d'activité",
      "Supervision standard",
    ],
  },
];

/* ────────────────────────────────────────────────────────────────
   4. LE COMPARATIF DÉTAILLÉ
   ──────────────────────────────────────────────────────────────── */

/** `true` = inclus · `false` = absent · une chaîne = mention spécifique */
export type ValeurComparatif = boolean | string;

export type LigneComparatif = {
  fonction: string;
  essentiel: ValeurComparatif;
  business: ValeurComparatif;
  enterprise: ValeurComparatif;
};

export type GroupeComparatif = {
  groupe: string;
  lignes: readonly LigneComparatif[];
};

export const COMPARATIF: readonly GroupeComparatif[] = [
  {
    groupe: "Commercial",
    lignes: [
      { fonction: "CRM, clients, contacts", essentiel: true, business: true, enterprise: true },
      { fonction: "Demandes clients", essentiel: true, business: true, enterprise: true },
      { fonction: "Devis", essentiel: true, business: true, enterprise: true },
    ],
  },
  {
    groupe: "Opérations",
    lignes: [
      { fonction: "Planning", essentiel: true, business: true, enterprise: true },
      { fonction: "Interventions", essentiel: true, business: true, enterprise: true },
      { fonction: "Application terrain", essentiel: true, business: true, enterprise: true },
      { fonction: "Comptes rendus", essentiel: true, business: true, enterprise: true },
      { fonction: "Photos et pièces jointes", essentiel: true, business: true, enterprise: true },
      { fonction: "Signature", essentiel: true, business: true, enterprise: true },
    ],
  },
  {
    groupe: "Équipes",
    lignes: [
      { fonction: "Utilisateurs bureau", essentiel: "Inclus", business: "Inclus", enterprise: "Inclus" },
      { fonction: "Heures et pointage", essentiel: true, business: true, enterprise: true },
      { fonction: "Absences", essentiel: true, business: true, enterprise: true },
      { fonction: "Notifications", essentiel: true, business: true, enterprise: true },
      { fonction: "Gestion avancée des équipes", essentiel: false, business: true, enterprise: true },
      { fonction: "Droits avancés", essentiel: false, business: true, enterprise: true },
    ],
  },
  {
    groupe: "Finance",
    lignes: [
      { fonction: "Facturation", essentiel: true, business: true, enterprise: true },
      { fonction: "Relances", essentiel: true, business: true, enterprise: true },
      { fonction: "Transfert comptable", essentiel: true, business: true, enterprise: true },
      { fonction: "Gestion des dépenses", essentiel: true, business: true, enterprise: true },
      { fonction: "Exports avancés", essentiel: false, business: true, enterprise: true },
    ],
  },
  {
    groupe: "Parc",
    lignes: [
      { fonction: "Flotte et matériel", essentiel: true, business: true, enterprise: true },
    ],
  },
  {
    groupe: "Pilotage",
    lignes: [
      { fonction: "KPI", essentiel: true, business: true, enterprise: true },
      { fonction: "Supervision standard", essentiel: true, business: true, enterprise: true },
      { fonction: "Supervision avancée", essentiel: false, business: true, enterprise: true },
      { fonction: "Tableaux de bord avancés", essentiel: false, business: true, enterprise: true },
      { fonction: "Reporting avancé", essentiel: false, business: true, enterprise: true },
      { fonction: "Reporting consolidé", essentiel: false, business: false, enterprise: true },
      { fonction: "KPI personnalisés", essentiel: false, business: false, enterprise: true },
    ],
  },
  {
    groupe: "Organisation et ouverture",
    lignes: [
      { fonction: "Automatisations avancées", essentiel: false, business: true, enterprise: true },
      { fonction: "Intégrations standards", essentiel: false, business: true, enterprise: true },
      { fonction: "Multi-sites", essentiel: false, business: "Option", enterprise: true },
      { fonction: "API", essentiel: false, business: "Option", enterprise: true },
    ],
  },
  {
    groupe: "Accompagnement",
    lignes: [
      { fonction: "Accompagnement renforcé", essentiel: false, business: true, enterprise: true },
      { fonction: "SLA", essentiel: false, business: false, enterprise: true },
    ],
  },
];

/** Ce que chaque offre ajoute, en une phrase. Sert au-dessus du tableau. */
export const DIFFERENCIATION: Record<IdPlan, string> = {
  essentiel:
    "Le socle complet, avec les KPI, les tableaux de bord et la supervision standards, et la gestion classique des utilisateurs et des rôles.",
  business:
    "Tout Essentiel, plus la supervision et les tableaux de bord avancés, le reporting avancé, les automatisations métier, les règles et les droits avancés, la gestion avancée des équipes, les intégrations standards, les exports avancés et le support prioritaire.",
  enterprise:
    "Tout Business, plus le multi-sites et le multi-agences, la consolidation, le reporting groupe, les KPI personnalisés, l'API, les intégrations avancées, les organisations complexes, les automatisations avancées, l'accompagnement renforcé, le support premium, le SLA et les configurations spécifiques prévues au contrat.",
};

/* ────────────────────────────────────────────────────────────────
   5. MISE EN SERVICE, FORMATION, ASSISTANCE
   ──────────────────────────────────────────────────────────────── */

export const MISE_EN_SERVICE = {
  prix: 399,
  badge: "Offerte aux 100 premières entreprises",
  comprend: [
    "Configuration initiale",
    "Création et vérification des accès",
    "Paramétrage de départ",
    "Accompagnement au démarrage",
    "Ressources de formation",
    "Vérification de la prise en main",
  ],
  reserve:
    "Une migration ou une configuration exceptionnelle peut faire l'objet d'une prestation complémentaire, annoncée et validée avant toute intervention.",
} as const;

export const TARIF_HORAIRE = 65;

export const SERVICES = [
  { libelle: "Formation vidéo", prix: "Incluse", detail: "Disponible dès l'ouverture de votre compte." },
  { libelle: "Formation personnalisée", prix: `${TARIF_HORAIRE} € HT / heure`, detail: "Une session sur vos propres cas, à la demande." },
  { libelle: "Assistance personnalisée", prix: `${TARIF_HORAIRE} € HT / heure`, detail: "Aide, paramétrage, accompagnement ponctuel." },
  { libelle: "Bug réel Argon", prix: "0 €", detail: "Un défaut du produit n'est jamais facturé. Jamais." },
] as const;

/** La frontière : ce que l'abonnement ne comprend pas. */
export const HORS_ABONNEMENT = [
  { libelle: "Mise en service", detail: `${MISE_EN_SERVICE.prix} € HT, une fois.` },
  { libelle: "Formation et assistance personnalisées", detail: `${TARIF_HORAIRE} € HT l'heure.` },
  { libelle: "SMS", detail: "En option, à la consommation." },
  { libelle: "Stockage supplémentaire", detail: "En option, au-delà du volume compris." },
  { libelle: "Développement spécifique", detail: "Sur devis, validé avant réalisation." },
] as const;

export const OPTIONS = [
  { libelle: "SMS", modalite: "À la consommation" },
  { libelle: "Stockage supplémentaire", modalite: "Option" },
  { libelle: "API et intégrations", modalite: "Selon le forfait et le besoin" },
  { libelle: "Développement spécifique", modalite: "Sur devis" },
] as const;

/* ────────────────────────────────────────────────────────────────
   6. LE SIMULATEUR DE VALEUR — les hypothèses, toutes visibles
   ──────────────────────────────────────────────────────────────── */

/**
 * RÈGLE TENUE ICI, ET ELLE EST STRUCTURANTE :
 *
 *   Le visiteur fournit les hypothèses. Argon ne fournit que l'arithmétique.
 *
 * Aucun coefficient n'est caché. Chaque `partReduite` ci-dessous est une
 * valeur de DÉPART affichée à l'écran sur un curseur que le visiteur déplace.
 * Le site ne dit jamais « Argon supprime 70 % de la ressaisie » : il demande
 * « sur ces heures, combien pensez-vous pouvoir supprimer ? ».
 *
 * C'est ce qui rend ce simulateur compatible avec la règle « aucun chiffre de
 * performance » tenue depuis le Lot 1 : le seul chiffre affirmé par Argon est
 * une multiplication.
 */

export type Levier = {
  id: string;
  /** Question posée au visiteur, à la première personne de SON activité. */
  question: string;
  unite: string;
  /** Valeur de départ du champ, modifiable. */
  defaut: number;
  min: number;
  max: number;
  pas: number;
  /** Périodicité de la saisie, ramenée au mois par `parMois`. */
  parMois: number;
  /** Part que le visiteur estime pouvoir supprimer, en %. Curseur visible. */
  partReduiteDefaut: number;
  /** Ce que le levier traite, en une ligne. Affiché sous la question. */
  note: string;
};

/* ────────────────────────────────────────────────────────────────
   LE SIMULATEUR DE VALEUR — trois questions, des hypothèses ouvertes

   ⚠️ RÈGLE FONDATRICE : le visiteur ne renseigne QUE ce qu'il connaît
   sans réfléchir — son effectif et son volume d'interventions. Tout le
   reste est une hypothèse AFFICHÉE et MODIFIABLE, jamais un coefficient
   caché. Une page de prix qui calcule en secret ne se rattrape pas.

   ⚠️ Aucune promesse. « Estimation de gains potentiels », toujours.
   Un solde négatif s'affiche tel quel : c'est ce qui rend le reste
   croyable.
   ──────────────────────────────────────────────────────────────── */

/** Les trois questions posées. Réponses à zéro : le visiteur les fournit. */
export type Question = {
  id: "bureau" | "terrain" | "interventions";
  libelle: string;
  unite: string;
  defaut: number;
  min: number;
  max: number;
};

export const QUESTIONS: readonly Question[] = [
  {
    id: "bureau",
    libelle: "Personnes au bureau",
    unite: "personnes",
    defaut: 0,
    min: 0,
    max: 200,
  },
  {
    id: "terrain",
    libelle: "Personnes sur le terrain",
    unite: "personnes",
    defaut: 0,
    min: 0,
    max: 500,
  },
  {
    id: "interventions",
    libelle: "Interventions par mois",
    unite: "interventions",
    defaut: 0,
    min: 0,
    max: 20000,
  },
];

/**
 * Les hypothèses. Chacune est rattachée à UNE des trois questions, ce qui
 * rend le calcul lisible : on voit d'où vient chaque heure.
 * `parMois` ramène la cadence de l'hypothèse à un mois.
 */
export type Hypothese = {
  id: string;
  question: Question["id"];
  libelle: string;
  /** Ce que l'hypothèse recouvre, en une ligne. */
  note: string;
  unite: string;
  defaut: number;
  min: number;
  max: number;
  pas: number;
  parMois: number;
};

export const HYPOTHESES: readonly Hypothese[] = [
  {
    id: "saisie",
    question: "interventions",
    libelle: "Temps administratif par intervention",
    note: "Reprendre la demande, retaper le compte rendu, préparer la ligne de facture.",
    unite: "min / intervention",
    defaut: 12,
    min: 0,
    max: 120,
    pas: 1,
    parMois: 1,
  },
  {
    id: "recherche",
    question: "bureau",
    libelle: "Temps passé chaque jour à chercher une information",
    note: "Retrouver un devis, un document, l'historique d'un client, le dernier échange.",
    unite: "min / jour / personne",
    defaut: 20,
    min: 0,
    max: 240,
    pas: 5,
    parMois: 21,
  },
  {
    id: "replanification",
    question: "terrain",
    libelle: "Temps passé chaque semaine à refaire le planning",
    note: "Urgences, absences, débordements, appels de confirmation.",
    unite: "min / semaine / personne",
    defaut: 15,
    min: 0,
    max: 300,
    pas: 5,
    parMois: 4.33,
  },
];

/** Part de ce temps que le visiteur estime pouvoir supprimer. Curseur visible. */
export const PART_SUPPRIMABLE = {
  defaut: 40,
  min: 0,
  max: 100,
  pas: 5,
  note: "Argon ne supprime pas tout ce temps. Ce curseur dit ce que vous pensez pouvoir en retirer.",
};

export const COUT_HORAIRE = {
  /* Seule hypothèse monétaire. Elle ne décrit pas l'activité du visiteur mais
     un ordre de grandeur de marché — d'où sa valeur de départ, affichée. */
  defaut: 35,
  min: 0,
  max: 200,
  pas: 1,
  note: "Coût horaire chargé moyen de la personne qui passe ce temps. C'est vous qui le connaissez.",
};

export const MENTION_SIMULATEUR =
  "Cette simulation repose sur les informations que vous renseignez et sur des hypothèses indicatives que vous pouvez modifier. Les gains réels dépendent de votre organisation, de vos volumes et de votre utilisation d'Argon. Certains bénéfices qualitatifs ne sont pas valorisés financièrement.";

/**
 * ⚠️ RÉÉCRITE LE 01/09/2026, ET IL LE FALLAIT.
 *
 * Elle disait : « Aucune de ces valeurs n'est envoyée, ni enregistrée, ni
 * transmise. » Depuis que le bloc de résultat propose de demander une
 * démonstration en emportant le résumé du calcul, cette phrase serait devenue
 * fausse — et une mention de confidentialité fausse coûte davantage que
 * l'information qu'elle protégeait.
 *
 * La nouvelle formulation dit la même chose sur le calcul, et dit en plus ce
 * qui peut partir, à quelle condition. Elle doit rester alignée sur le texte
 * du bloc `SuiteDuCalcul` : si l'un change, l'autre change.
 */
export const MENTION_CONFIDENTIALITE =
  "Tout est calculé dans votre navigateur : aucune de ces valeurs n'est envoyée ni enregistrée pendant que vous les saisissez. Si vous demandez une démonstration depuis le bloc de résultat, son résumé accompagne votre demande — il vous est alors affiché, et vous pouvez le retirer.";

/* ────────────────────────────────────────────────────────────────
   7. FAQ
   ──────────────────────────────────────────────────────────────── */

export const FAQ_TARIFS = [
  {
    question: "À partir de quand un utilisateur terrain est-il facturé ?",
    answer:
      "Le jour où son compte est créé et où son profil est chargé sur un téléphone. Un compte créé mais jamais chargé sur un appareil n'est pas facturé, et un compte suspendu ou archivé cesse de l'être.",
  },
  {
    question: "Sur quelle durée s'engage-t-on ?",
    answer:
      "L'abonnement est mensuel, par période de 30 jours, avec un engagement de douze mois reconduit à chaque date anniversaire. Pour l'arrêter, vous prévenez un mois avant cette date. Le mois entamé est facturé en entier.",
  },
  {
    question: "Comment se règle l'abonnement ?",
    answer:
      "La première échéance se règle par carte, au moment de la mise en service, puis par prélèvement mensuel. Vous pouvez aussi régler l'année en une fois : l'abonnement plateforme est alors réduit de 10 %. Cette remise ne porte que sur la part plateforme — les utilisateurs terrain restent au tarif plein.",
  },
  {
    question: "Les utilisateurs bureau sont-ils facturés ?",
    answer:
      "Non. Ils sont inclus dans l'abonnement plateforme, quel que soit leur nombre. Seuls les utilisateurs terrain actifs sont facturés.",
  },
  {
    question: "Que se passe-t-il si je désactive un technicien ?",
    answer:
      "Un utilisateur terrain suspendu ou archivé n'est pas facturé. Vous ne payez que les licences réellement actives.",
  },
  {
    question: "Dois-je passer à Business si j'ai beaucoup de techniciens ?",
    answer:
      "Non. Le nombre d'utilisateurs terrain ne déclenche aucun changement de forfait. Vous choisissez votre offre selon les fonctions et le niveau de pilotage dont vous avez besoin, pas selon la taille de votre équipe.",
  },
  {
    question: "Puis-je changer de forfait ?",
    answer:
      "Oui, dans les deux sens. Le changement porte sur les fonctions ouvertes, vos données restent les mêmes.",
  },
  {
    question: "La mise en service est-elle payante ?",
    answer:
      "Elle est facturée 399 € HT une fois, et elle est offerte aux 100 premières entreprises. Elle comprend la configuration initiale, les accès, le paramétrage de départ et l'accompagnement au démarrage.",
  },
  {
    question: "La formation est-elle incluse ?",
    answer:
      "Les formations vidéo sont incluses. Une session personnalisée, sur vos propres cas, est facturée 65 € HT l'heure.",
  },
  {
    question: "Un bug est-il facturé ?",
    answer:
      "Jamais. Un défaut réel d'Argon est corrigé sans facturation. La distinction est claire : un bug est inclus, une aide, une formation ou un paramétrage relèvent des 65 € HT l'heure, et un développement spécifique fait l'objet d'un devis.",
  },
  {
    question: "Les SMS sont-ils inclus ?",
    answer: "Non, c'est une option facturée à la consommation.",
  },
  {
    question: "Et si j'ai un besoin spécifique ?",
    answer:
      "Les intégrations et les développements spécifiques sont chiffrés séparément et validés avant toute réalisation. Rien n'est engagé sans votre accord.",
  },
] as const;

/* ────────────────────────────────────────────────────────────────
   8. FORMATAGE
   ──────────────────────────────────────────────────────────────── */

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const nombre1 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export const formaterEuros = (v: number) => euros.format(Math.round(v));
export const formaterNombre = (v: number) => nombre.format(v);
export const formaterHeures = (v: number) => nombre1.format(v);
