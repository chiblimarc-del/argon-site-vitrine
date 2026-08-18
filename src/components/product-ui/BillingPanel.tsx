import { LogoMark } from "@/components/ui/Logo";

/**
 * FICHE CLIENT — quatrième interface Argon recréée en code.
 *
 * Montre ce que la page démontre : sur une seule fiche, le devis, l'intervention
 * qui en découle, le contrôle, puis la facture. La continuité se voit avant
 * d'être expliquée.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ — VIGILANCE RENFORCÉE SUR CETTE PAGE
 *
 * Montré, car validé produit : fiche client, devis, relance d'un devis resté
 * sans réponse, intervention, contrôle avant facturation, génération et envoi
 * de la facture.
 *
 * INTERDIT ABSOLU ici — aucune de ces briques n'existe :
 *   · statut « Payée », suivi des règlements, échéances, encaissement
 *   · TVA, écritures, export comptable, rapprochement bancaire
 *   · recouvrement ou relance de facture automatisés
 *   · « pilotage financier », « comptabilité automatisée »
 *
 * Le fil des statuts s'arrête donc volontairement à « Envoyée ». Ajouter un
 * statut de paiement transformerait cette maquette en fausse promesse.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Etat = "accepte" | "termine" | "valide" | "envoye" | "attente";

const etats: Record<Etat, { libelle: string; pastille: string; puce: string }> = {
  accepte: { libelle: "Accepté", pastille: "bg-ok/12 text-ok", puce: "bg-ok" },
  termine: { libelle: "Terminée", pastille: "bg-ok/12 text-ok", puce: "bg-ok" },
  valide: { libelle: "Validée", pastille: "bg-ok/12 text-ok", puce: "bg-ok" },
  envoye: { libelle: "Envoyée", pastille: "bg-info/12 text-info", puce: "bg-info" },
  attente: {
    libelle: "Sans réponse",
    pastille: "bg-warn/12 text-warn",
    puce: "bg-warn",
  },
};

const fil: {
  ref: string;
  type: string;
  objet: string;
  repere: string;
  etat: Etat;
  action?: string;
}[] = [
  {
    ref: "DV-2214",
    type: "Devis",
    objet: "Remplacement groupe froid",
    repere: "envoyé le 12/09",
    etat: "accepte",
  },
  {
    ref: "IN-4821",
    type: "Intervention",
    objet: "Maintenance climatisation",
    repere: "réalisée le 24/09",
    etat: "termine",
  },
  {
    ref: "—",
    type: "Contrôle",
    objet: "Vérification avant facturation",
    repere: "le 24/09",
    etat: "valide",
  },
  {
    ref: "FA-1187",
    type: "Facture",
    objet: "Établie depuis l'intervention",
    repere: "envoyée le 25/09",
    etat: "envoye",
  },
];

/** Un devis en attente, pour montrer la relance sans rien automatiser. */
const devisEnAttente = {
  ref: "DV-2231",
  objet: "Contrat d'entretien annuel",
  repere: "envoyé il y a 11 jours",
};

export function BillingPanel() {
  return (
    <div aria-hidden="true" className="select-none">
      <div className="glass-strong overflow-hidden rounded-[var(--radius-lg)]">
        {/* ---------- Barre d'application ---------- */}
        <div className="flex items-center gap-2.5 border-b border-line-soft bg-surface-2/60 px-4 py-3">
          <LogoMark className="h-4 w-4 shrink-0 text-argon" />
          <span className="text-[11px] font-semibold tracking-[0.14em] text-ink">
            ARGON
          </span>
          <span className="truncate text-[11px] text-ink-muted">
            Clients <span className="opacity-50">›</span> Fiche client
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* ---------- En-tête de fiche ---------- */}
          <div className="rounded-lg border border-line-soft bg-surface p-3">
            <p className="text-[15px] font-semibold text-ink">
              Site industriel — Mérignac
            </p>
            <p className="mt-1 text-[11.5px] text-ink-muted">
              Contact : M. Bertrand · Site : zone d&apos;activité nord
            </p>
          </div>

          {/* ---------- Le fil : devis → intervention → contrôle → facture ---------- */}
          <div>
            <p className="mb-2.5 text-[11px] font-medium text-ink">
              Historique du dossier
            </p>

            <ol className="relative">
              <span
                aria-hidden="true"
                className="absolute bottom-5 left-[4px] top-3 w-px bg-line"
              />

              {fil.map((element) => {
                const etat = etats[element.etat];
                return (
                  <li key={element.type} className="relative pb-2.5 pl-6 last:pb-0">
                    <span
                      className={`absolute left-0 top-[11px] h-[9px] w-[9px] rounded-full ${etat.puce}`}
                    />
                    <div className="rounded-lg border border-line-soft bg-surface px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-medium text-ink">
                          {element.type}
                        </span>
                        <span className="shrink-0 whitespace-nowrap font-mono text-[10.5px] text-ink-muted">
                          {element.ref}
                        </span>
                        <span
                          className={`ml-auto shrink-0 rounded-full px-2 py-[2px] text-[10px] font-medium ${etat.pastille}`}
                        >
                          {etat.libelle}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-muted">
                        <span className="min-w-0 flex-1 truncate">
                          {element.objet}
                        </span>
                        <span className="shrink-0 whitespace-nowrap">
                          {element.repere}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ---------- Devis en attente : visible, relançable, pas automatique ---------- */}
          <div className="rounded-lg border border-warn/25 bg-surface p-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warn" />
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-warn">
                À relancer
              </span>
              <span className="ml-auto shrink-0 whitespace-nowrap text-[10.5px] text-ink-muted">
                {devisEnAttente.repere}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="shrink-0 whitespace-nowrap font-mono text-[10.5px] text-ink-muted">
                {devisEnAttente.ref}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">
                {devisEnAttente.objet}
              </span>
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
