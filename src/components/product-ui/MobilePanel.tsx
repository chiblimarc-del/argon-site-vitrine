import { LogoMark } from "@/components/ui/Logo";

/**
 * ÉCRAN MOBILE DU TECHNICIEN — cinquième interface Argon recréée en code.
 *
 * Les quatre autres montrent le point de vue du bureau (liste, fiche, planning,
 * dossier client). Celle-ci montre le point de vue du terrain : ce que
 * l'intervenant a réellement sous les yeux.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ
 * Montré, car validé produit : mission reçue, informations du site, statut,
 * photos, signature du client, signalement d'anomalie, compte rendu.
 *
 * INTERDIT ABSOLU ici — aucune de ces briques n'existe :
 *   · navigation, itinéraire, carte embarquée, géolocalisation
 *   · mode hors-ligne (listé comme extension FUTURE dans le schéma V1)
 *   · pointage, heures, notes de frais (domaine RH, non validé)
 *   · scan de code-barres, stocks, pièces
 * ─────────────────────────────────────────────────────────────────────────
 */

const etapes = [
  { libelle: "Accepter la mission", fait: true },
  { libelle: "Démarrer l'intervention", fait: true },
  { libelle: "Photos et observations", fait: true },
  { libelle: "Faire signer le client", fait: false },
];

export function MobilePanel() {
  return (
    <div aria-hidden="true" className="select-none">
      <div className="mx-auto w-full max-w-[300px]">
        {/* Châssis du téléphone */}
        <div className="glass-strong overflow-hidden rounded-[28px] p-2">
          <div className="overflow-hidden rounded-[22px] bg-canvas">
            {/* Barre d'application */}
            <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2/60 px-3.5 py-2.5">
              <LogoMark id="mobile-mark" className="h-3.5 w-3.5 shrink-0 text-argon" />
              <span className="text-[10px] font-semibold tracking-[0.14em] text-ink">
                ARGON
              </span>
              <span className="ml-auto rounded-full bg-info/12 px-2 py-[2px] text-[9.5px] font-medium text-info">
                En cours
              </span>
            </div>

            <div className="space-y-3 p-3.5">
              {/* La mission */}
              <div>
                <p className="font-mono text-[10px] text-ink-muted">IN-4821 · 08:30</p>
                <p className="mt-1 text-[14px] font-semibold leading-tight text-ink">
                  Maintenance climatisation
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                  Site industriel — Mérignac
                  <br />
                  Contact sur place : M. Bertrand
                </p>
              </div>

              {/* Ce que le technicien doit faire */}
              <ol className="space-y-1.5 rounded-lg border border-line-soft bg-surface p-2.5">
                {etapes.map((etape) => (
                  <li key={etape.libelle} className="flex items-center gap-2">
                    <span
                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                        etape.fait
                          ? "border-ok/50 bg-ok/20 text-ok"
                          : "border-line bg-surface-2 text-transparent"
                      }`}
                    >
                      <svg viewBox="0 0 12 12" className="h-2 w-2">
                        <path
                          d="m2.5 6 2.5 2.5L9.5 3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      className={`text-[11px] ${
                        etape.fait ? "text-ink-muted line-through" : "text-ink"
                      }`}
                    >
                      {etape.libelle}
                    </span>
                  </li>
                ))}
              </ol>

              {/* Ce qu'il a remonté */}
              <div className="rounded-lg border border-line-soft bg-surface p-2.5">
                <p className="mb-2 text-[10px] font-medium text-ink">
                  Photos ajoutées
                </p>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="flex h-9 flex-1 items-center justify-center rounded border border-line bg-surface-2"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3 text-ink-muted"
                        fill="none"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
                        <path
                          d="M4.5 17.5 9 13l3.5 3 3-2.5 4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ))}
                </div>
              </div>

              {/* Anomalie signalée */}
              <div className="rounded-lg border border-warn/25 bg-warn/[0.06] p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                  <span className="text-[9.5px] font-medium uppercase tracking-[0.1em] text-warn">
                    Anomalie signalée
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-ink">
                  Pièce manquante — second passage à prévoir
                </p>
              </div>

              {/* Action en attente */}
              <div className="rounded-lg bg-accent px-3 py-2.5 text-center text-[12px] font-medium text-white">
                Faire signer le client
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-ink-muted">
        Interface Argon reproduite en code — données d&apos;illustration.
      </p>
    </div>
  );
}
