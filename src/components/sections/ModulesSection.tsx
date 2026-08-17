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
 * terrain · signature client · comptes rendus · génération PDF · SAS
 * d'anomalie · génération et envoi des factures.
 *
 * INTERDIT : IA, géolocalisation avancée, optimisation automatique de
 * tournées, gestion de stocks, RH, BI avancée, comptabilité. Argon n'est
 * présenté ni comme un ERP ni comme un logiciel comptable. Le vocabulaire
 * imposé pour la facturation est « génération et envoi des factures ».
 *
 * Toute brique ajoutée ici doit être validée produit au préalable : cette
 * section se lit comme un inventaire de fonctionnalités disponibles.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Famille = "vendre" | "organiser" | "executer" | "administrer";

const familles: Record<Famille, { label: string; texte: string; puce: string }> = {
  vendre: { label: "Vendre", texte: "text-cyan", puce: "bg-cyan" },
  organiser: {
    label: "Organiser",
    texte: "text-accent-mid",
    puce: "bg-accent-mid",
  },
  executer: { label: "Exécuter", texte: "text-accent-text", puce: "bg-accent" },
  administrer: {
    label: "Administrer",
    texte: "text-accent2-text",
    puce: "bg-accent-2",
  },
};

type Module = {
  famille: Famille;
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
    famille: "vendre",
    path: "/solutions/devis-facturation",
    titre: "CRM & devis",
    texte:
      "Clients, contacts et sites d'intervention réunis sur une fiche. Le devis est établi depuis cette fiche, envoyé, puis retrouvé au même endroit.",
    icone: <IconeFiche />,
  },
  {
    famille: "vendre",
    titre: "Relances",
    texte:
      "Un devis resté sans réponse demeure visible et relançable. Les échanges avec le client restent attachés à son dossier.",
    icone: <IconeRelance />,
  },
  {
    famille: "organiser",
    path: "/solutions/planning-interventions",
    titre: "Planning & affectation",
    texte:
      "Affectez chaque intervention à un intervenant et à un créneau. Le planning des équipes se lit d'un seul coup d'œil.",
    icone: <IconePlanning />,
  },
  {
    famille: "executer",
    titre: "Application mobile",
    texte:
      "Le technicien reçoit sa mission, consulte les informations du site et remonte son compte rendu depuis son téléphone.",
    icone: <IconeMobile />,
  },
  {
    famille: "executer",
    titre: "Comptes rendus",
    texte:
      "Généré en PDF à la clôture, avec les photos et la signature du client, puis transmis automatiquement.",
    icone: <IconeDocument />,
  },
  {
    famille: "administrer",
    titre: "Facturation",
    texte:
      "Génération et envoi des factures à partir des interventions réalisées, une fois celles-ci contrôlées.",
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
            Tout ce qu&apos;il faut pour gérer une opération,{" "}
            <span className="text-gradient">
              du premier contact au compte rendu
            </span>
            .
          </>
        }
        description="Sept briques, quatre familles, une seule plateforme. Chacune alimente la suivante — c'est la même donnée qui circule, jamais une ressaisie."
        className="max-w-3xl"
      />

      {/* ---------- Brique dominante : l'intervention terrain ---------- */}
      <article className="card relative mt-14 overflow-hidden">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12">
          <div>
            <EtiquetteFamille famille="executer" />

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

            <EtiquetteFamille famille={module.famille} />

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

/** Étiquette de famille : pastille colorée + libellé. */
function EtiquetteFamille({ famille }: { famille: Famille }) {
  const { label, texte, puce } = familles[famille];
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${puce}`} />
      <span
        className={`text-[11px] font-medium uppercase tracking-[0.12em] ${texte}`}
      >
        {label}
      </span>
    </span>
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
