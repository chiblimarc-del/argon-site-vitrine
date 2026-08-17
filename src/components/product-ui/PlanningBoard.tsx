import { LogoMark } from "@/components/ui/Logo";

/**
 * TABLEAU DE PLANNING — troisième interface Argon recréée en code.
 *
 * Distincte des deux autres : le Hero de l'accueil montre la liste des
 * interventions du jour, la fiche montre le détail d'une intervention, celle-ci
 * montre la répartition des équipes sur la journée.
 *
 * Aucune image : HTML, CSS et SVG. Les blocs sont positionnés en pourcentage
 * de la plage horaire, donc le tableau reste lisible de 320 px à 1440 px sans
 * défilement horizontal.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ (cahier V2 §31)
 * Montré ici, car validé produit : intervenants, créneaux, affectation,
 * statuts, interventions non encore affectées.
 *
 * INTERDIT : toute suggestion d'optimisation automatique, de calcul
 * d'itinéraire, de « technicien le plus proche » ou de proposition par IA.
 * Le tableau montre ce qui est planifié ; il ne planifie pas à votre place.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Bloc = {
  /** Position et durée en pourcentage de la plage 08 h – 18 h. */
  debut: number;
  duree: number;
  objet: string;
  ton: "en-cours" | "planifiee" | "terminee" | "retard";
};

const tons: Record<Bloc["ton"], string> = {
  "en-cours": "bg-info/25 border-info/50 text-info",
  planifiee: "bg-accent/20 border-accent/45 text-accent-text",
  terminee: "bg-ok/18 border-ok/40 text-ok",
  retard: "bg-warn/20 border-warn/45 text-warn",
};

const lignes: { intervenant: string; blocs: Bloc[] }[] = [
  {
    intervenant: "T. Renaud",
    blocs: [
      { debut: 2, duree: 16, objet: "Maintenance climatisation", ton: "terminee" },
      { debut: 26, duree: 20, objet: "Visite d'entretien", ton: "en-cours" },
      { debut: 62, duree: 18, objet: "Contrôle annuel", ton: "planifiee" },
    ],
  },
  {
    intervenant: "S. Lambert",
    blocs: [
      { debut: 8, duree: 22, objet: "Dépannage chaudière", ton: "retard" },
      { debut: 48, duree: 26, objet: "Remise en service", ton: "planifiee" },
    ],
  },
  {
    intervenant: "J. Delmas",
    blocs: [
      { debut: 14, duree: 30, objet: "Installation coffret", ton: "en-cours" },
      { debut: 70, duree: 16, objet: "Réception chantier", ton: "planifiee" },
    ],
  },
  {
    intervenant: "M. Ferrand",
    blocs: [{ debut: 4, duree: 24, objet: "Tournée matinale", ton: "terminee" }],
  },
];

/** Interventions reçues mais pas encore affectées. */
const aAffecter = [
  { ref: "IN-4831", objet: "Dépannage — Résidence Les Pins", creneau: "avant 16:00" },
  { ref: "IN-4832", objet: "Entretien — Agence Talence", creneau: "dans la journée" },
];

const heures = ["08h", "10h", "12h", "14h", "16h", "18h"];

export function PlanningBoard() {
  return (
    <div aria-hidden="true" className="select-none">
      <div className="glass-strong overflow-hidden rounded-[var(--radius-lg)]">
        {/* ---------- Barre d'application ---------- */}
        <div className="flex items-center gap-2.5 border-b border-line-soft bg-surface-2/60 px-4 py-3">
          <LogoMark id="planning-mark" className="h-4 w-4 shrink-0 text-argon" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-ink">
            ARGON
          </span>
          <span className="truncate text-[11px] text-ink-muted">
            Planning <span className="opacity-50">›</span> Aujourd&apos;hui
          </span>
          <span className="ml-auto hidden shrink-0 text-[11px] text-ink-muted sm:inline">
            4 intervenants
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {/* ---------- Échelle horaire ---------- */}
          <div className="flex items-center gap-3">
            <span className="w-[74px] shrink-0" />
            <div className="flex flex-1 justify-between text-[10px] tabular-nums text-ink-muted">
              {heures.map((heure) => (
                <span key={heure}>{heure}</span>
              ))}
            </div>
          </div>

          {/* ---------- Lignes d'intervenants ---------- */}
          <div className="mt-2.5 space-y-2">
            {lignes.map((ligne) => (
              <div key={ligne.intervenant} className="flex items-center gap-3">
                <span className="w-[74px] shrink-0 truncate text-[11.5px] text-ink-soft">
                  {ligne.intervenant}
                </span>

                <div className="relative h-9 flex-1 overflow-hidden rounded-md border border-line-soft bg-surface">
                  {/* Repères horaires, très discrets. */}
                  {[20, 40, 60, 80].map((position) => (
                    <span
                      key={position}
                      className="absolute inset-y-0 w-px bg-line-soft"
                      style={{ left: `${position}%` }}
                    />
                  ))}

                  {ligne.blocs.map((bloc) => (
                    <span
                      key={bloc.debut}
                      className={`absolute inset-y-[3px] flex items-center overflow-hidden rounded border px-2 text-[10px] font-medium ${tons[bloc.ton]}`}
                      style={{ left: `${bloc.debut}%`, width: `${bloc.duree}%` }}
                    >
                      <span className="truncate">{bloc.objet}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ---------- File d'attente : ce qui n'est pas encore affecté ---------- */}
          <div className="mt-5 rounded-lg border border-line-soft bg-surface-2/40 p-3">
            <div className="mb-2.5 flex items-baseline justify-between">
              <p className="text-[11px] font-medium text-ink">À affecter</p>
              <span className="text-[10.5px] text-ink-muted">
                {aAffecter.length} interventions
              </span>
            </div>

            <ul className="space-y-1.5">
              {aAffecter.map((element) => (
                <li
                  key={element.ref}
                  className="flex items-center gap-2 rounded-md border border-dashed border-line bg-surface px-2.5 py-2"
                >
                  <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-ink-muted">
                    {element.ref}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink">
                    {element.objet}
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-[10.5px] text-ink-muted">
                    {element.creneau}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-ink-muted">
        Interface Argon reproduite en code — données d&apos;illustration.
      </p>
    </div>
  );
}
