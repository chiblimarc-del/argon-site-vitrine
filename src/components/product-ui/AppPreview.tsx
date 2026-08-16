import { LogoMark } from "@/components/ui/Logo";

/**
 * APERÇU DE L'INTERFACE ARGON — recréé intégralement en code.
 *
 * Aucune image, aucune capture bitmap : uniquement du HTML, du CSS et du SVG.
 * Conséquences (cahier V2 §29) : poids négligeable, net sur tous les écrans,
 * aucun décalage de mise en page, et le contenu reste modifiable au fil des
 * évolutions du produit.
 *
 * RÈGLE DE VÉRITÉ (V2 §31) — ce composant ne montre que des éléments
 * d'interface réellement présents dans Argon : missions, statuts, techniciens,
 * horaires, carte des interventions, planning. Les valeurs affichées sont des
 * données d'illustration, signalées comme telles sous le panneau. On n'affiche
 * volontairement AUCUN indicateur de performance (pourcentages de réussite,
 * gains de productivité, évolutions) : ce serait une preuve commerciale
 * fabriquée.
 *
 * Décoratif pour les technologies d'assistance : le texte utile de la page est
 * porté par le Hero, pas par cette maquette.
 */

type Statut = "en-cours" | "planifiee" | "terminee" | "retard";

const statuts: Record<Statut, { label: string; dot: string; pill: string }> = {
  "en-cours": {
    label: "En cours",
    dot: "bg-info",
    pill: "bg-info/12 text-info",
  },
  planifiee: {
    label: "Planifiée",
    dot: "bg-ink-muted",
    pill: "bg-ink-muted/15 text-ink-soft",
  },
  terminee: {
    label: "Terminée",
    dot: "bg-ok",
    pill: "bg-ok/12 text-ok",
  },
  retard: {
    label: "En retard",
    dot: "bg-warn",
    pill: "bg-warn/12 text-warn",
  },
};

const missions: {
  ref: string;
  objet: string;
  client: string;
  intervenant: string;
  heure: string;
  statut: Statut;
}[] = [
  {
    ref: "IN-4821",
    objet: "Maintenance climatisation",
    client: "Site industriel — Mérignac",
    intervenant: "T. Renaud",
    heure: "08:30",
    statut: "en-cours",
  },
  {
    ref: "IN-4822",
    objet: "Dépannage chaudière",
    client: "Résidence — Pessac",
    intervenant: "S. Lambert",
    heure: "10:15",
    statut: "retard",
  },
  {
    ref: "IN-4823",
    objet: "Installation coffret",
    client: "Bâtiment tertiaire — Bordeaux",
    intervenant: "J. Delmas",
    heure: "13:00",
    statut: "planifiee",
  },
  {
    ref: "IN-4819",
    objet: "Visite d'entretien",
    client: "Agence — Talence",
    intervenant: "M. Ferrand",
    heure: "07:45",
    statut: "terminee",
  },
];

/** Éléments de la barre latérale. L'actif correspond à l'écran affiché. */
const rubriques = [
  { label: "Tableau de bord", actif: false },
  { label: "Interventions", actif: true },
  { label: "Planning", actif: false },
  { label: "Équipes", actif: false },
  { label: "Clients", actif: false },
  { label: "Véhicules", actif: false },
  { label: "Rapports", actif: false },
];

export function AppPreview() {
  return (
    <div aria-hidden="true" className="select-none">
      <div className="glass-strong overflow-hidden rounded-[var(--radius-lg)]">
        {/* ---------- Barre d'application ---------- */}
        <div className="flex items-center gap-3 border-b border-line-soft bg-surface-2/60 px-4 py-3">
          <LogoMark id="preview-mark" className="h-4 w-4 shrink-0 text-argon" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-ink">
            ARGON
          </span>

          <span className="ml-2 hidden text-[11px] text-ink-muted sm:inline">
            Interventions — Aujourd&apos;hui
          </span>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden h-6 w-32 rounded-md border border-line bg-surface md:block" />
            <span className="h-6 w-6 rounded-full bg-accent/25 ring-1 ring-accent/40" />
          </div>
        </div>

        <div className="flex items-stretch">
          {/* ---------- Barre latérale ---------- */}
          <nav className="hidden w-[164px] shrink-0 border-r border-line-soft bg-surface-2/30 p-3 lg:block">
            <ul className="space-y-0.5">
              {rubriques.map((rubrique) => (
                <li
                  key={rubrique.label}
                  className={[
                    "flex items-center gap-2 rounded-md px-2.5 py-[7px] text-[12px]",
                    rubrique.actif
                      ? "bg-accent/15 text-ink"
                      : "text-ink-muted",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      rubrique.actif ? "bg-accent" : "bg-line",
                    ].join(" ")}
                  />
                  {rubrique.label}
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------- Contenu ---------- */}
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
              {/* Liste des interventions */}
              <div className="min-w-0">
                <div className="mb-2.5 flex items-baseline justify-between">
                  <h3 className="text-[12px] font-medium text-ink">
                    Interventions du jour
                  </h3>
                  <span className="text-[11px] text-ink-muted">4 affichées</span>
                </div>

                <ul className="space-y-1.5">
                  {missions.map((mission) => {
                    const statut = statuts[mission.statut];
                    return (
                      <li
                        key={mission.ref}
                        className="rounded-lg border border-line-soft bg-surface px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${statut.dot}`}
                          />
                          <span className="truncate text-[12.5px] font-medium text-ink">
                            {mission.objet}
                          </span>
                          <span
                            className={`ml-auto shrink-0 rounded-full px-2 py-[2px] text-[10px] font-medium ${statut.pill}`}
                          >
                            {statut.label}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 pl-3.5 text-[11px] text-ink-muted">
                          <span className="shrink-0 whitespace-nowrap font-mono">
                            {mission.ref}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {mission.client}
                          </span>
                          <span className="shrink-0 whitespace-nowrap tabular-nums">
                            {mission.heure} · {mission.intervenant}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Colonne droite : carte + planning */}
              <div className="min-w-0 space-y-4">
                <div>
                  <h3 className="mb-2.5 text-[12px] font-medium text-ink">
                    Carte des interventions
                  </h3>
                  <MapPanel />
                </div>

                <div>
                  <h3 className="mb-2.5 text-[12px] font-medium text-ink">
                    Planning des équipes
                  </h3>
                  <PlanningPanel />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*
        Mention explicite : le panneau reproduit l'interface d'Argon, mais les
        valeurs affichées sont illustratives. On ne fait pas passer une maquette
        pour une capture de production.
      */}
      <p className="mt-3 text-center text-[11px] text-ink-muted lg:text-right">
        Interface Argon reproduite en code — données d&apos;illustration.
      </p>
    </div>
  );
}

/**
 * Carte des interventions.
 * Réseau viaire abstrait : aucune géographie réelle n'est représentée, il
 * serait malhonnête de suggérer une couverture ou des clients localisés.
 */
function MapPanel() {
  const points = [
    { x: 38, y: 30, tone: "text-info" },
    { x: 96, y: 52, tone: "text-warn" },
    { x: 150, y: 34, tone: "text-ok" },
    { x: 66, y: 82, tone: "text-ok" },
    { x: 178, y: 92, tone: "text-info" },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line-soft bg-surface">
      {/* Hauteur bornée + `slice` : sur une seule colonne (mobile, tablette)
          la carte reste compacte au lieu de s'étirer sur toute la largeur. */}
      <svg
        viewBox="0 0 220 120"
        preserveAspectRatio="xMidYMid slice"
        className="h-[132px] w-full lg:h-[124px]"
        role="presentation"
        focusable="false"
      >
        {/* Trame de fond */}
        <defs>
          <pattern id="trame" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M20 0H0V20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-line-soft"
            />
          </pattern>
        </defs>
        <rect width="220" height="120" fill="url(#trame)" />

        {/* Axes principaux */}
        <g
          className="text-line"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M0 78 C40 70 62 44 104 40 S170 52 220 34" />
          <path d="M28 0 C34 40 20 70 44 120" />
          <path d="M132 0 C138 36 160 62 156 120" />
        </g>

        {/* Tournée en cours */}
        <path
          d="M38 30 L96 52 L150 34"
          fill="none"
          strokeWidth="1.6"
          strokeDasharray="3 3"
          strokeLinecap="round"
          className="text-accent"
          stroke="currentColor"
        />

        {/* Positions */}
        {points.map((point) => (
          <g key={`${point.x}-${point.y}`} className={point.tone}>
            <circle
              cx={point.x}
              cy={point.y}
              r="7"
              fill="currentColor"
              opacity="0.16"
            />
            <circle cx={point.x} cy={point.y} r="3" fill="currentColor" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * Bandeau de planning : trois intervenants, créneaux positionnés sur la journée.
 * Les largeurs sont exprimées en pourcentage de la plage horaire affichée.
 */
function PlanningPanel() {
  const lignes = [
    {
      nom: "T. Renaud",
      creneaux: [
        { debut: 4, duree: 26, tone: "bg-info/70" },
        { debut: 44, duree: 20, tone: "bg-accent/60" },
      ],
    },
    {
      nom: "S. Lambert",
      creneaux: [
        { debut: 14, duree: 18, tone: "bg-warn/70" },
        { debut: 56, duree: 30, tone: "bg-accent/60" },
      ],
    },
    {
      nom: "J. Delmas",
      creneaux: [{ debut: 30, duree: 44, tone: "bg-ok/60" }],
    },
  ];

  return (
    <div className="rounded-lg border border-line-soft bg-surface p-3">
      <div className="mb-2 flex justify-between text-[10px] tabular-nums text-ink-muted">
        <span>08h</span>
        <span>12h</span>
        <span>16h</span>
        <span>19h</span>
      </div>

      <div className="space-y-2">
        {lignes.map((ligne) => (
          <div key={ligne.nom} className="flex items-center gap-2">
            <span className="w-[62px] shrink-0 truncate text-[10.5px] text-ink-muted">
              {ligne.nom}
            </span>
            <div className="relative h-3.5 flex-1 rounded-[3px] bg-surface-2">
              {ligne.creneaux.map((creneau) => (
                <span
                  key={creneau.debut}
                  className={`absolute inset-y-0 rounded-[3px] ${creneau.tone}`}
                  style={{
                    left: `${creneau.debut}%`,
                    width: `${creneau.duree}%`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
