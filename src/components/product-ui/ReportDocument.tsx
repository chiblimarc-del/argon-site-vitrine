import { LogoMark } from "@/components/ui/Logo";

/**
 * COMPTE RENDU D'INTERVENTION — sixième interface Argon recréée en code.
 *
 * Ici on ne montre pas un écran de l'application mais le DOCUMENT lui-même :
 * ce que le client reçoit. C'est l'objet de la page, et c'est ce que le
 * visiteur cherche quand il tape « rapport d'intervention ».
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ
 * Montré, car validé produit : référence, client et site, intervenant,
 * horaires, description de ce qui a été fait, photos, anomalie signalée,
 * signature du client, génération PDF.
 *
 * INTERDIT : formulaires personnalisables, check-lists paramétrables,
 * modèles de rapport configurables par l'utilisateur, mesures ou relevés
 * techniques, conformité réglementaire. Rien de tout cela n'est validé.
 * ─────────────────────────────────────────────────────────────────────────
 */

const lignes = [
  { cle: "Référence", valeur: "IN-4821" },
  { cle: "Client", valeur: "Site industriel — Mérignac" },
  { cle: "Intervenant", valeur: "T. Renaud" },
  { cle: "Date", valeur: "24/09 · 08:30 — 09:42" },
];

export function ReportDocument() {
  return (
    <div aria-hidden="true" className="select-none">
      {/* Feuille de document — fond clair assumé : c'est un PDF, pas un écran. */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[#f7f8fc] shadow-2xl shadow-black/50">
        <div className="p-5 sm:p-6">
          {/* En-tête du document */}
          <div className="flex items-start justify-between gap-4 border-b border-[#dfe3ef] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-[#0a1240]">
                <LogoMark className="h-4 w-4 text-argon" />
              </span>
              <span className="text-[12px] font-semibold tracking-[0.12em] text-[#0a1240]">
                ARGON
              </span>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-semibold text-[#0a1240]">
                Compte rendu d&apos;intervention
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-[#6b7290]">
                IN-4821 · émis le 24/09
              </p>
            </div>
          </div>

          {/* Bloc d'identification */}
          <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5">
            {lignes.map((ligne) => (
              <div key={ligne.cle} className="min-w-0">
                <dt className="text-[9px] uppercase tracking-[0.1em] text-[#8990a8]">
                  {ligne.cle}
                </dt>
                <dd className="mt-0.5 truncate text-[11.5px] text-[#1a1f38]">
                  {ligne.valeur}
                </dd>
              </div>
            ))}
          </dl>

          {/* Ce qui a été fait */}
          <div className="mt-5">
            <p className="text-[9px] uppercase tracking-[0.1em] text-[#8990a8]">
              Intervention réalisée
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#1a1f38]">
              Nettoyage des filtres, contrôle des pressions et remise en service
              du groupe. Fonctionnement vérifié en présence du client.
            </p>
          </div>

          {/* Réserve */}
          <div className="mt-4 rounded border-l-[3px] border-[#e0a020] bg-[#fdf6e7] px-3 py-2">
            <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#a8761a]">
              Anomalie signalée
            </p>
            <p className="mt-1 text-[11px] leading-snug text-[#4a3a12]">
              Pièce manquante sur site — second passage à prévoir.
            </p>
          </div>

          {/* Photos */}
          <div className="mt-5">
            <p className="text-[9px] uppercase tracking-[0.1em] text-[#8990a8]">
              Photos jointes
            </p>
            <div className="mt-2 flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="flex h-12 flex-1 items-center justify-center rounded border border-[#dfe3ef] bg-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#aab0c4]" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
                    <path
                      d="M4.5 17.5 9 13l3.5 3 3-2.5 4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          {/* Signature */}
          <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#dfe3ef] pt-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.1em] text-[#8990a8]">
                Signature du client
              </p>
              <svg viewBox="0 0 120 26" className="mt-1 h-7 w-[110px] text-[#1a1f38]">
                <path
                  d="M5 19c5-1 7-11 11-11s2 12 6 12 5-13 9-13 3 11 7 11 4-7 7-7 3 5 6 5c4 0 6-4 9-4 4 0 6 4 10 4 5 0 8-5 12-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-right text-[9.5px] leading-snug text-[#8990a8]">
              M. Bertrand
              <br />
              24/09 · 09:42
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-ink-muted">
        Compte rendu Argon reproduit en code — données d&apos;illustration.
      </p>
    </div>
  );
}
