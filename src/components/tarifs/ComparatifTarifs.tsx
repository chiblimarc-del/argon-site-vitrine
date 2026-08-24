/**
 * COMPARATIF DÉTAILLÉ
 * ===================
 *
 * ZÉRO JAVASCRIPT. Deux rendus du même contenu, arbitrés en CSS pur :
 *   · desktop — un tableau, en-tête collante, lecture en diagonale ;
 *   · mobile  — une carte par offre, parce qu'un tableau de trente lignes
 *               sur 390 px n'est pas un tableau, c'est un mur.
 *
 * Un tableau de fonctions est, ailleurs sur ce site, exactement le catalogue
 * que la règle éditoriale interdit. Il est admis ICI et seulement ici : le
 * visiteur d'une page de tarifs ne découvre plus le produit, il arbitre entre
 * trois offres, et un tableau est l'outil de cet arbitrage.
 *
 * Le catalogue reste donc confiné à ce composant. Les sections qui l'entourent
 * disent ce que le socle permet, pas ce qu'il contient.
 */

import { COMPARATIF, PLANS, type ValeurComparatif } from "@/lib/tarifs";

function Cellule({ valeur, offre }: { valeur: ValeurComparatif; offre: string }) {
  if (valeur === true) {
    return (
      <>
        <span aria-hidden="true" className="text-accent">
          ✓
        </span>
        <span className="sr-only">Compris dans l&apos;offre {offre}</span>
      </>
    );
  }
  if (valeur === false) {
    return (
      <>
        <span aria-hidden="true" className="text-ink-soft">
          —
        </span>
        <span className="sr-only">Non compris dans l&apos;offre {offre}</span>
      </>
    );
  }
  return <span className="text-sm text-ink-soft">{valeur}</span>;
}

export function ComparatifTarifs() {
  return (
    <>
      {/* ══ Desktop ═══════════════════════════════════════════ */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Comparaison détaillée des offres Essentiel, Business et Enterprise
          </caption>

          <thead className="sticky top-16 z-10 bg-surface">
            <tr className="border-b border-line">
              <th scope="col" className="py-4 pr-4 text-sm font-semibold text-ink">
                Fonction
              </th>
              {PLANS.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className={[
                    "w-32 px-3 py-4 text-center text-sm font-semibold",
                    plan.recommande ? "text-accent" : "text-ink",
                  ].join(" ")}
                >
                  {plan.libelle}
                  {plan.recommande && (
                    <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide">
                      Recommandé
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {COMPARATIF.map((groupe) => (
            <tbody key={groupe.groupe}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="bg-surface-alt px-0 py-2 pl-4 text-xs font-semibold uppercase tracking-wide text-ink-soft"
                >
                  {groupe.groupe}
                </th>
              </tr>

              {groupe.lignes.map((ligne) => (
                <tr key={ligne.fonction} className="border-b border-line-soft">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-sm font-normal text-ink-soft"
                  >
                    {ligne.fonction}
                  </th>
                  <td className="px-3 py-3 text-center">
                    <Cellule valeur={ligne.essentiel} offre="Essentiel" />
                  </td>
                  <td className="bg-accent/[0.04] px-3 py-3 text-center">
                    <Cellule valeur={ligne.business} offre="Business" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Cellule valeur={ligne.enterprise} offre="Enterprise" />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {/* ══ Mobile ════════════════════════════════════════════ */}
      <div className="space-y-4 md:hidden">
        {PLANS.map((plan) => (
          <details
            key={plan.id}
            open={plan.recommande}
            className="group rounded-2xl border border-line bg-surface"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <span>
                <span className="block font-semibold text-ink">
                  {plan.libelle}
                </span>
                <span className="block text-sm text-ink-soft">
                  {plan.verbe}
                  {plan.recommande && " · Recommandé"}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="text-ink-soft transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>

            <div className="border-t border-line-soft px-5 pb-5">
              {COMPARATIF.map((groupe) => (
                <div key={groupe.groupe} className="mt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    {groupe.groupe}
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {groupe.lignes.map((ligne) => {
                      const v = ligne[plan.id];
                      return (
                        <li
                          key={ligne.fonction}
                          className="flex items-baseline justify-between gap-3 text-sm"
                        >
                          <span
                            className={
                              v === false ? "text-ink-soft" : "text-ink-soft"
                            }
                          >
                            {ligne.fonction}
                          </span>
                          <span className="shrink-0">
                            <Cellule valeur={v} offre={plan.libelle} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
