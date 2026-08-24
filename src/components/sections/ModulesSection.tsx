import { Section, SectionHeading } from "@/components/ui/Section";
import { InterventionPanel } from "@/components/product-ui/InterventionPanel";
import { NavLink } from "@/components/navigation/NavLink";

/**
 * SECTION 4 — LES BRIQUES FONCTIONNELLES.
 *
 * Parti pris : ne PAS aligner sept cartes identiques. Un catalogue met toutes
 * les briques au même niveau, alors que le positionnement d'Argon repose sur
 * l'intervention terrain — c'est la porte d'entrée SEO et commerciale.
 *
 * Hiérarchie retenue :
 *   1. « Interventions terrain » occupe une carte pleine largeur, illustrée par
 *      une vraie interface Argon recréée en code (la fiche d'intervention).
 *   2. Les six autres briques sont des modules secondaires : cartes compactes,
 *      pictogramme monochrome, deux lignes de texte, pas d'interface.
 *
 * Les quatre familles (Vendre, Organiser, Exécuter, Administrer) parcourent le
 * dégradé de marque de gauche à droite — cyan, bleu, indigo, violet — soit
 * exactement les arrêts de `.text-gradient`. Le même chemin chromatique que la
 * chaîne de gestion de la section 3, pour que les deux sections se répondent.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ (cahier V2 §31) — PÉRIMÈTRE VALIDÉ PRODUIT
 *
 * Présenté : CRM et gestion clients · devis · relances clients · planning et
 * affectation · interventions terrain · application mobile technicien · photos
 * terrain · signature client · comptes rendus · génération PDF · fenêtre
 * Anomalies · SAS de Contrôle · génération et envoi des factures.
 *
 * INTERDIT : IA, géolocalisation avancée, optimisation automatique de
 * tournées, gestion de stocks, RH, BI avancée, TENUE de comptabilité. Argon
 * n'est présenté ni comme un ERP ni comme un logiciel comptable. Le vocabulaire
 * imposé pour la facturation est « génération et envoi des factures ».
 *
 * Toute brique ajoutée ici doit être validée produit au préalable : cette
 * section se lit comme un inventaire de fonctionnalités disponibles.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Module = {
  /** Ce que la brique reçoit de la précédente. */
  recoit: string;
  /** Ce qu'elle transmet à la suivante. */
  transmet: string;
  titre: string;
  texte: string;
  icone: React.ReactNode;
  /**
   * Page solution correspondante, quand elle existe au registre. Rend la carte
   * cliquable : l'accueil transmet ainsi un lien CONTEXTUEL aux pages P0, et
   * pas seulement les liens sitewide de l'en-tête et du pied de page — que
   * Google pondère nettement moins. Défaut relevé à l'audit global.
   */
  path?: string;
};

const modules: Module[] = [
  {
    recoit: "la demande du client",
    transmet: "le devis accepté",
    path: "/solutions/devis-facturation",
    titre: "Clients & devis",
    texte:
      "Le devis part de la fiche client et y reste attaché. Vous ne cherchez pas ce que vous avez proposé à qui.",
    icone: <IconeFiche />,
  },
  {
    recoit: "les devis sans réponse",
    transmet: "la décision de relancer",
    path: "/solutions/devis-facturation",
    titre: "Relances",
    texte:
      "Un devis sans réponse se repère à son état, pas de mémoire. Vous savez lequel relancer, et rien ne part sans vous.",
    icone: <IconeRelance />,
  },
  {
    recoit: "le devis accepté",
    transmet: "l'intervention affectée",
    path: "/solutions/planning-interventions",
    titre: "Planning & affectation",
    texte:
      "La journée se réorganise sans que rien ne se perde. Une urgence à 10 h ne coûte pas une demi-heure de téléphone.",
    icone: <IconePlanning />,
  },
  {
    recoit: "les absences accordées",
    transmet: "qui est réellement disponible",
    path: "/solutions/heures-et-absences",
    titre: "Heures & absences",
    texte:
      "Un congé accordé ferme le planning et remplit la grille des heures au même instant. Personne ne recopie rien.",
    icone: <IconePlanning />,
  },
  {
    recoit: "l'intervention affectée",
    transmet: "ce qui s'est passé sur place",
    path: "/solutions/application-mobile-technicien",
    titre: "Application mobile",
    texte:
      "L'intervenant a ce qu'il lui faut avant d'arriver, et remonte ce qu'il a fait sans repasser au bureau.",
    icone: <IconeMobile />,
  },
  {
    recoit: "ce qui s'est passé sur place",
    transmet: "le document reçu par le client",
    path: "/solutions/rapports-intervention",
    titre: "Comptes rendus",
    texte:
      "Photos, réserves et signature du client dans un PDF daté. Une contestation trois mois plus tard trouve à qui parler.",
    icone: <IconeDocument />,
  },
  {
    recoit: "l'intervention contrôlée",
    transmet: "la facture, et ce qui reste dû",
    path: "/solutions/devis-facturation",
    titre: "Facturation",
    texte:
      "Rien ne part en facturation sans avoir été contrôlé. Et une intervention faite ne finit pas par n'être jamais facturée.",
    icone: <IconeFacture />,
  },
];

/** Points saillants de la brique dominante. Tous validés produit. */
const pointsIntervention = [
  "Client, site et intervenant sur la même fiche",
  "Statuts d'avancement, de l'affectation à la clôture",
  "Photos terrain et signature du client",
  "Compte rendu PDF généré puis transmis",
];

export function ModulesSection() {
  return (
    <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
      <SectionHeading
        eyebrow="Les briques d'Argon"
        title={
          <>
            Chaque brique reprend là où la précédente s&apos;arrête,{" "}
            <span className="text-gradient">de la demande à la facture</span>.
          </>
        }
        description="Huit briques. Aucune ne redemande ce qu'une autre sait déjà : chacune reçoit ce que la précédente a produit."
        className="max-w-3xl"
      />

      {/* ---------- Brique dominante : l'intervention terrain ---------- */}
      <article className="card relative mt-14 overflow-hidden">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12">
          <div>
            <FluxBrique recoit="tout ce qui précède" transmet="une fiche qui fait foi" />

            <h3 className="mt-4 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              <LienBrique path="/solutions/gestion-interventions">
                Interventions terrain
              </LienBrique>
            </h3>

            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Le cœur d&apos;Argon. Chaque intervention porte son client, son
              intervenant, son créneau, ses photos, sa signature et son compte
              rendu. Tout ce qui s&apos;est passé sur le terrain reste attaché à
              la fiche.
            </p>

            <ul className="mt-7 space-y-3">
              {pointsIntervention.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Coche />
                  <span className="text-[14.5px] leading-snug text-ink-soft">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <InterventionPanel />
          </div>
        </div>
      </article>

      {/* ---------- Modules secondaires ---------- */}
      <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <li
            key={module.titre}
            className={`card relative flex flex-col p-6${
              module.path
                ? " transition-colors duration-200 hover:border-accent/40 hover:bg-surface-2"
                : ""
            }`}
          >
            <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface-2 text-ink-soft">
              {module.icone}
            </span>

            <FluxBrique recoit={module.recoit} transmet={module.transmet} />

            <h3 className="mt-2.5 text-base font-semibold text-ink">
              {module.path ? (
                <LienBrique path={module.path}>{module.titre}</LienBrique>
              ) : (
                module.titre
              )}
            </h3>

            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
              {module.texte}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * Titre de brique cliquable. Le pseudo-élément étend la zone de clic à toute
 * la carte tout en n'émettant qu'UN seul lien : une seule cible dans l'ordre
 * de tabulation, un seul lien à crawler.
 * Si la route n'est pas publiée, NavLink rend un texte inerte — la carte
 * redevient simplement descriptive.
 */
function LienBrique({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink href={path} className="after:absolute after:inset-0 after:content-['']">
      {children}
    </NavLink>
  );
}

/**
 * Ce que la brique reçoit, ce qu'elle transmet.
 *
 * ⚠️ Remplace l'ancienne étiquette de famille. Quatre familles présentaient
 * le produit comme quatre paquets de fonctions indépendants — la forme
 * contredisait la promesse. Ici, chaque carte dit d'où vient sa matière et
 * où elle va : la grille lue de haut en bas EST la démonstration.
 *
 * Ne pas remettre de regroupement par famille.
 */
function FluxBrique({
  recoit,
  transmet,
}: {
  recoit: string;
  transmet: string;
}) {
  return (
    <p className="text-[11px] leading-relaxed text-ink-soft">
      <span className="uppercase tracking-[0.12em]">Reçoit</span>{" "}
      {recoit}
      <span aria-hidden="true" className="mx-1.5 text-accent">
        →
      </span>
      <span className="uppercase tracking-[0.12em]">transmet</span>{" "}
      <span className="text-ink">{transmet}</span>
    </p>
  );
}

function Coche() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="mt-[3px] h-4 w-4 shrink-0 text-accent"
      fill="none"
    >
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" opacity="0.4" />
      <path
        d="m6.5 10.2 2.4 2.3 4.6-4.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ==========================================================================
   PICTOGRAMMES
   Tracés inline plutôt qu'une librairie d'icônes : quelques centaines
   d'octets contre une trentaine de kilo-octets (cahier V2 §29).
   ========================================================================== */

const traits = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconeFiche() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" {...traits} />
      <path d="M8 8h8M8 12h8M8 16h4" {...traits} />
    </svg>
  );
}

function IconeRelance() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M20 6v5h-5" {...traits} />
      <path d="M20 11a8 8 0 1 0-2.3 5.3" {...traits} />
      <path d="M12 8v4l2.5 1.5" {...traits} />
    </svg>
  );
}

function IconePlanning() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" {...traits} />
      <path d="M3 10h18M8 3v4M16 3v4" {...traits} />
      <path d="M7 14h5M7 17.5h8" {...traits} />
    </svg>
  );
}

function IconeMobile() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" {...traits} />
      <path d="M10.5 5.5h3" {...traits} />
      <path d="M12 18.2h.01" {...traits} strokeWidth={2} />
    </svg>
  );
}

function IconeDocument() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" {...traits} />
      <path d="M14 3v5h5" {...traits} />
      <path d="M9 13.5l1.8 1.8 3.5-3.6" {...traits} />
    </svg>
  );
}

function IconeFacture() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M6 3h12v18l-3-1.8L12 21l-3-1.8L6 21V3Z" {...traits} />
      <path d="M9.5 8.5h5M9.5 12h5" {...traits} />
    </svg>
  );
}
