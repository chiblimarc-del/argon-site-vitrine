import { LogoMark } from "@/components/ui/Logo";

/**
 * FICHE D'INTERVENTION — deuxième interface Argon recréée en code.
 *
 * Volontairement différente de l'écran du Hero : celui-ci montre la liste des
 * interventions du jour, celui-ci montre le détail d'une intervention. On ne
 * réutilise pas la même maquette deux fois sur la même page.
 *
 * Aucune image, aucune capture bitmap : HTML, CSS et SVG uniquement.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ (cahier V2 §31)
 * Éléments montrés, tous validés côté produit : intervention, client et site,
 * intervenant affecté, créneau, statuts d'avancement, photos terrain,
 * signature client, compte rendu PDF, transmission au client.
 *
 * INTERDIT ici : géolocalisation avancée, optimisation de tournées, IA,
 * stocks, RH, BI, comptabilité. Aucune carte, aucun itinéraire, aucun
 * indicateur de performance.
 *
 * Les valeurs affichées sont des données d'illustration — jamais des mesures
 * réalisées par Argon.
 * ─────────────────────────────────────────────────────────────────────────
 */

const etapes = [
  { libelle: "Affectée", heure: "08:02", etat: "fait" },
  { libelle: "Acceptée", heure: "08:07", etat: "fait" },
  { libelle: "Démarrée", heure: "08:30", etat: "fait" },
  { libelle: "Terminée", heure: "09:42", etat: "fait" },
] as const;

const informations = [
  { cle: "Client", valeur: "Site industriel — Mérignac" },
  { cle: "Intervenant", valeur: "T. Renaud" },
  { cle: "Créneau", valeur: "08:30 — 10:00" },
];

export function InterventionPanel() {
  return (
    <div aria-hidden="true" className="select-none">
      <div className="glass-strong overflow-hidden rounded-[var(--radius-lg)]">
        {/* ---------- Barre d'application ---------- */}
        <div className="flex items-center gap-2.5 border-b border-line-soft bg-surface-2/60 px-4 py-3">
          <LogoMark id="fiche-mark" className="h-4 w-4 shrink-0 text-argon" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-ink">
            ARGON
          </span>
          <span className="truncate text-[11px] text-ink-muted">
            Interventions <span className="opacity-50">›</span> IN-4821
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-ok/12 px-2 py-[3px] text-[10px] font-medium text-ok">
            Terminée
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* ---------- En-tête de la fiche ---------- */}
          <div>
            <p className="font-mono text-[11px] text-ink-muted">IN-4821</p>
            <h3 className="mt-1 text-[15px] font-semibold text-ink">
              Maintenance climatisation
            </h3>
          </div>

          <dl className="grid gap-x-4 gap-y-2 rounded-lg border border-line-soft bg-surface p-3 sm:grid-cols-3">
            {informations.map((info) => (
              <div key={info.cle} className="min-w-0">
                <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">
                  {info.cle}
                </dt>
                <dd className="mt-0.5 truncate text-[12.5px] text-ink">
                  {info.valeur}
                </dd>
              </div>
            ))}
          </dl>

          {/* ---------- Avancement ---------- */}
          <div className="rounded-lg border border-line-soft bg-surface p-3">
            <p className="mb-3 text-[11px] font-medium text-ink">Avancement</p>
            <ol className="flex items-start justify-between gap-1">
              {etapes.map((etape, index) => (
                <li key={etape.libelle} className="relative min-w-0 flex-1">
                  {/* Filet reliant l'étape à la précédente. */}
                  {index > 0 ? (
                    <span className="absolute right-1/2 top-[5px] h-px w-full bg-ok/40" />
                  ) : null}
                  <span className="relative mx-auto block h-[9px] w-[9px] rounded-full bg-ok" />
                  <p className="mt-2 truncate text-center text-[10.5px] text-ink-soft">
                    {etape.libelle}
                  </p>
                  <p className="text-center text-[10px] tabular-nums text-ink-muted">
                    {etape.heure}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* ---------- Photos et signature ---------- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line-soft bg-surface p-3">
              <p className="mb-2.5 text-[11px] font-medium text-ink">
                Photos terrain
              </p>
              <div className="flex gap-2">
                {[0, 1, 2].map((index) => (
                  <PhotoSlot key={index} />
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-line-soft bg-surface p-3">
              <p className="mb-2.5 text-[11px] font-medium text-ink">
                Signature du client
              </p>
              <SignatureSlot />
            </div>
          </div>

          {/* ---------- Compte rendu ---------- */}
          <div className="flex items-center gap-3 rounded-lg border border-line-soft bg-surface-2/50 p-3">
            <PdfGlyph />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-ink">
                Compte rendu IN-4821.pdf
              </p>
              <p className="text-[11px] text-ink-muted">
                Généré à la clôture · transmis au client
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-ok/12 px-2 py-[3px] text-[10px] font-medium text-ok">
              Envoyé
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-ink-muted">
        Interface Argon reproduite en code — données d&apos;illustration.
      </p>
    </div>
  );
}

/**
 * Emplacement de photo. Volontairement abstrait : afficher une fausse photo
 * de chantier serait une image d'illustration déguisée en donnée produit.
 */
function PhotoSlot() {
  return (
    <div className="flex h-12 flex-1 items-center justify-center rounded-md border border-line bg-surface-2">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-muted" fill="none">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
        <path
          d="M4.5 17.5 9 13l3.5 3 3-2.5 4 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** Signature manuscrite, tracée en SVG. */
function SignatureSlot() {
  return (
    <div className="flex h-12 items-center justify-center rounded-md border border-line bg-surface-2 px-3">
      <svg viewBox="0 0 120 28" className="h-7 w-auto text-ink-soft">
        <path
          d="M6 20c5-1 7-12 11-12s2 13 6 13 5-14 9-14 3 12 7 12 4-8 7-8 3 6 6 6c4 0 6-4 9-4 4 0 6 5 10 5 5 0 8-6 12-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PdfGlyph() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-cyan">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path
          d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
