import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * SECTION 3 — LA CHAÎNE DE GESTION.
 *
 * Raconte la continuité réelle du produit : commercial → exploitation →
 * administration, avec le SAS d'anomalie en charnière entre le terrain et la
 * facturation.
 *
 * Écho visuel inversé de la section 2 : là où les liaisons étaient rompues et
 * les surfaces désalignées, tout est ici relié et aligné. Même vocabulaire
 * graphique, message opposé.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ (cahier V2 §31) — PÉRIMÈTRE VALIDÉ PAR LE PRODUIT
 *
 * Présenté ici, car confirmé disponible :
 *   CRM / gestion clients · devis · relances clients · planning et affectation
 *   application mobile technicien · photos terrain · signature client
 *   compte rendu d'intervention · génération PDF · SAS d'anomalie
 *   génération et envoi des factures
 *
 * INTERDIT dans cette section, car non disponible :
 *   géolocalisation avancée · optimisation automatique de tournées · IA
 *   (planning ou rapports) · gestion de stocks · RH · BI avancée
 *
 * INTERDIT également :
 *   présenter Argon comme un ERP ou comme un logiciel comptable ; promettre
 *   une INTÉGRATION comptable — un connecteur vers un logiciel nommé — tant
 *   qu'aucune n'est validée. Le vocabulaire imposé reste « génération et
 *   envoi des factures ».
 *
 *   La TRANSMISSION vers la comptabilité, elle, existe et est autorisée
 *   depuis le contrôle produit du 18/08/2026 : export par période et accès
 *   cabinet. Elle n'a pas sa place dans cette section, qui décrit la chaîne
 *   d'exploitation ; elle est portée par /solutions/devis-facturation.
 *   Interdiction distincte, donc, et à ne pas confondre : « intégration »
 *   promet un branchement, « transmission » décrit une sortie de données.
 *
 * Toute évolution de ce périmètre doit passer par une validation produit
 * avant d'être écrite ici.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Domaine = {
  cle: string;
  titre: string;
  /** Rôle du domaine, en une ligne. */
  intention: string;
  /** Classe de couleur d'accent, propre au domaine. */
  accent: string;
  /** Classe de fond pour la pastille d'étape. */
  puce: string;
  etapes: { nom: string; detail: string }[];
};

const domaines: Domaine[] = [
  {
    cle: "commercial",
    titre: "Commercial",
    intention: "Avant l'intervention",
    accent: "text-cyan",
    puce: "bg-cyan",
    etapes: [
      {
        nom: "Prospect",
        detail: "La demande entrante est enregistrée dès le premier contact.",
      },
      {
        nom: "CRM",
        detail: "Clients, contacts et sites d'intervention réunis sur une fiche.",
      },
      {
        nom: "Devis",
        detail: "Établi puis envoyé au client, rattaché à sa fiche.",
      },
      {
        nom: "Relance",
        detail: "Un devis resté sans réponse reste visible et relançable.",
      },
    ],
  },
  {
    cle: "exploitation",
    titre: "Exploitation",
    intention: "Pendant l'intervention",
    accent: "text-accent-text",
    puce: "bg-accent",
    etapes: [
      {
        nom: "Demande",
        detail: "Le devis accepté devient une demande d'intervention.",
      },
      {
        nom: "Planning",
        detail: "Affectation à un intervenant et positionnement sur un créneau.",
      },
      {
        nom: "Terrain",
        detail: "Mission, photos et signature du client depuis l'application mobile.",
      },
      {
        nom: "Compte rendu",
        detail: "Généré en PDF à la clôture, transmis au client.",
      },
    ],
  },
  {
    cle: "administration",
    titre: "Administration",
    intention: "Après l'intervention",
    accent: "text-accent2-text",
    puce: "bg-accent-2",
    etapes: [
      {
        nom: "Contrôle",
        detail: "L'intervention est vérifiée avant d'entrer en facturation.",
      },
      {
        nom: "Facture",
        detail: "Génération de la facture à partir de l'intervention réalisée.",
      },
      {
        nom: "Envoi",
        detail: "La facture part au client et reste attachée à son historique.",
      },
    ],
  },
];

export function ChainSection() {
  return (
    <Section containerWidth="wide" className="border-b border-line-soft">
      <ContinuousLines />

      <SectionHeading
        eyebrow="La continuité de gestion"
        title={
          <>
            De la demande client à la facture,{" "}
            <span className="text-gradient">sans ressaisie</span>.
          </>
        }
        description="Une demande client devient un devis. Le devis devient une mission. La mission devient un compte rendu. Le compte rendu devient une facture. À chaque étape, l'information saisie une fois alimente la suivante."
        className="max-w-3xl"
      />

      {/* Trois domaines, reliés par des connecteurs continus en grand écran. */}
      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-0">
        <DomaineCard domaine={domaines[0]} />
        <Connecteur />
        <DomaineCard domaine={domaines[1]} />
        <Connecteur />
        <DomaineCard domaine={domaines[2]} />
      </div>

      <AnomalyGate />

      {/*
        Positionnement en trois phrases. Formulé avec « souvent » et
        « rarement » : on décrit une tendance de marché observable, pas une
        affirmation absolue sur chaque concurrent — c'est défendable.
      */}
      <p className="mt-14 max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">
        Les logiciels d&apos;intervention s&apos;arrêtent souvent au compte
        rendu. Les logiciels de gestion voient rarement ce qui se passe sur le
        terrain.{" "}
        <span className="font-medium text-ink">Argon relie les deux.</span>
      </p>
    </Section>
  );
}

/** Colonne d'un domaine : en-tête, puis étapes reliées par un filet vertical. */
function DomaineCard({ domaine }: { domaine: Domaine }) {
  return (
    <div className="card flex flex-col p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className={`text-sm font-semibold ${domaine.accent}`}>
          {domaine.titre}
        </h3>
        <span className="text-[11px] text-ink-muted">{domaine.intention}</span>
      </div>

      <ol className="relative mt-6">
        {/* Filet continu reliant les étapes — l'inverse des liaisons rompues
            de la section « problème ». */}
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-[3px] top-2 w-px bg-line"
        />

        {domaine.etapes.map((etape) => (
          <li key={etape.nom} className="relative pb-6 pl-6 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute left-0 top-[5px] h-[7px] w-[7px] rounded-full ${domaine.puce}`}
            />
            <p className="text-[15px] font-medium leading-none text-ink">
              {etape.nom}
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
              {etape.detail}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Flèche de liaison entre deux domaines. Visible en grand écran uniquement. */
function Connecteur() {
  return (
    <div
      aria-hidden="true"
      className="hidden items-center justify-center px-3 lg:flex"
    >
      <svg viewBox="0 0 40 8" className="h-2 w-10 text-line">
        <path
          d="M0 4h32m0 0-4-3m4 3-4 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Le SAS d'anomalie — charnière entre le compte rendu terrain et la facture.
 * Décrit exactement le parcours défini côté produit : le compte rendu part
 * automatiquement au client, sauf en cas d'anomalie ; l'intervention est alors
 * mise en attente, analysée, puis validée ou corrigée avant facturation.
 */
function AnomalyGate() {
  return (
    <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-warn/25 bg-surface">
      <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:gap-10">
        <div className="lg:max-w-md">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-warn"
            />
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-warn">
              La charnière
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-ink sm:text-xl">
            Rien ne part en facturation sans avoir été contrôlé.
          </h3>
        </div>

        <div className="lg:flex-1">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            À la clôture, le compte rendu est transmis automatiquement au
            client. Sauf si le technicien a signalé une anomalie : pièce
            manquante, accès impossible, prestation modifiée sur place.
            L&apos;intervention entre alors dans le{" "}
            <span className="font-medium text-ink">SAS d&apos;anomalie</span>,
            où elle est analysée avant d&apos;être validée ou corrigée.
          </p>

          {/* Représentation du parcours de l'anomalie. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[12px]">
            <Jalon>Compte rendu</Jalon>
            <Fleche />
            <Jalon ton="alerte">SAS d&apos;anomalie</Jalon>
            <Fleche />
            <Jalon>Contrôle</Jalon>
            <Fleche />
            <Jalon>Facture</Jalon>
          </div>
        </div>
      </div>
    </div>
  );
}

function Jalon({
  children,
  ton = "neutre",
}: {
  children: React.ReactNode;
  ton?: "neutre" | "alerte";
}) {
  return (
    <span
      className={[
        "rounded-full border px-2.5 py-1 font-medium",
        ton === "alerte"
          ? "border-warn/30 bg-warn/10 text-warn"
          : "border-line bg-surface-2 text-ink-soft",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Fleche() {
  return (
    <svg
      viewBox="0 0 16 8"
      aria-hidden="true"
      className="h-2 w-4 shrink-0 text-line"
    >
      <path
        d="M0 4h11m0 0-3-2.5M11 4l-3 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Décor de fond : des liaisons continues, sans interruption.
 * Contrepoint exact des traits en pointillés de la section « problème ».
 */
function ContinuousLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-40"
      >
        <g
          className="text-line-soft"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M-20 120 C220 90 340 200 600 190 S980 110 1220 150" />
          <path d="M-20 470 C260 500 420 400 700 430 S1020 520 1220 470" />
        </g>
      </svg>
    </div>
  );
}
