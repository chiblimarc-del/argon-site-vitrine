"use client";

/**
 * SIMULATEUR DE VALEUR — trois questions, des hypothèses ouvertes.
 *
 * ⚠️ La version précédente demandait onze informations. Un dirigeant capable
 * d'estimer son temps de ressaisie hebdomadaire et sa part réaffectable est
 * rare ; celui qui saisit n'importe quoi obtient un résultat auquel il ne
 * croit pas, et c'est la crédibilité de toute la page qui tombe avec.
 *
 * Ne sont donc demandés que trois chiffres qu'on connaît sans réfléchir.
 * Tout le reste est une hypothèse affichée sous le résultat, pré-remplie,
 * modifiable, et rattachée à la question dont elle dépend — pour qu'on voie
 * d'où vient chaque heure.
 *
 * ⚠️ AUCUN COEFFICIENT CACHÉ. Si une valeur entre dans le calcul, elle est à
 * l'écran. C'est la seule chose qui distingue ce simulateur d'un argumentaire.
 *
 * ⚠️ Un solde négatif s'affiche tel quel.
 */

import { useMemo, useState } from "react";
import {
  COUT_HORAIRE,
  HYPOTHESES,
  MENTION_CONFIDENTIALITE,
  MENTION_SIMULATEUR,
  PART_SUPPRIMABLE,
  PLANS,
  QUESTIONS,
  formaterEuros,
  formaterHeures,
  prixMensuel,
  type IdPlan,
} from "@/lib/tarifs";

export function SimulateurValeur({
  planRetenu = "business",
  terrainsRetenus = 12,
}: {
  planRetenu?: IdPlan;
  terrainsRetenus?: number;
}) {
  const [reponses, setReponses] = useState<Record<string, number>>(() =>
    Object.fromEntries(QUESTIONS.map((q) => [q.id, q.defaut])),
  );
  const [hypotheses, setHypotheses] = useState<Record<string, number>>(() =>
    Object.fromEntries(HYPOTHESES.map((h) => [h.id, h.defaut])),
  );
  const [part, setPart] = useState(PART_SUPPRIMABLE.defaut);
  const [coutHoraire, setCoutHoraire] = useState(COUT_HORAIRE.defaut);
  const [ouvert, setOuvert] = useState(false);

  const plan = PLANS.find((p) => p.id === planRetenu) ?? PLANS[1];

  const r = useMemo(() => {
    /* Chaque hypothèse produit des heures, à partir de la question dont elle
       dépend. Le détail reste disponible : c'est lui qu'on affiche. */
    const detail = HYPOTHESES.map((h) => {
      const quantite = reponses[h.question] ?? 0;
      const heures = (quantite * (hypotheses[h.id] ?? 0) * h.parMois) / 60;
      return { id: h.id, libelle: h.libelle, heures };
    });

    const heuresTotales = detail.reduce((s, d) => s + d.heures, 0);
    const heuresRecuperees = heuresTotales * (part / 100);
    const valeur = heuresRecuperees * coutHoraire;
    const cout = prixMensuel(plan, terrainsRetenus);

    return { detail, heuresTotales, heuresRecuperees, valeur, cout, solde: valeur - cout };
  }, [reponses, hypotheses, part, coutHoraire, plan, terrainsRetenus]);

  const rienSaisi = QUESTIONS.every((q) => (reponses[q.id] ?? 0) === 0);

  const champ =
    "h-11 w-28 rounded-lg border border-line bg-surface px-3 text-center text-lg font-semibold tabular-nums text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {/* ══ Les trois questions ═══════════════════════════════════ */}
      <div>
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <p className="text-base font-semibold text-ink">
            Trois chiffres, et rien d&apos;autre.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Ceux que vous connaissez de tête. Le reste est calculé sous vos
            yeux, à partir d&apos;hypothèses que vous pouvez changer.
          </p>

          <dl className="mt-6 space-y-5">
            {QUESTIONS.map((q) => (
              <div
                key={q.id}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <dt>
                  <label
                    htmlFor={`q-${q.id}`}
                    className="text-sm font-medium text-ink"
                  >
                    {q.libelle}
                  </label>
                </dt>
                <dd className="flex items-center gap-3">
                  <input
                    id={`q-${q.id}`}
                    type="number"
                    inputMode="numeric"
                    min={q.min}
                    max={q.max}
                    value={reponses[q.id] ?? 0}
                    onChange={(e) =>
                      setReponses((v) => ({
                        ...v,
                        [q.id]: Math.min(
                          q.max,
                          Math.max(q.min, Math.round(Number(e.target.value) || 0)),
                        ),
                      }))
                    }
                    className={champ}
                  />
                  <span className="w-28 text-sm text-ink-soft">{q.unite}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ══ Les hypothèses, repliées ════════════════════════════ */}
        <div className="mt-4 rounded-2xl border border-line bg-surface">
          <button
            type="button"
            onClick={() => setOuvert((v) => !v)}
            aria-expanded={ouvert}
            className="flex w-full items-center justify-between gap-3 rounded-2xl p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span>
              <span className="block text-sm font-semibold text-ink">
                Voir et modifier les hypothèses
              </span>
              <span className="mt-1 block text-sm text-ink-soft">
                Elles sont pré-remplies. Aucune n&apos;est cachée.
              </span>
            </span>
            <span aria-hidden="true" className="text-lg text-ink-soft">
              {ouvert ? "−" : "+"}
            </span>
          </button>

          {ouvert && (
            <div className="border-t border-line-soft p-5 sm:p-6">
              <dl className="space-y-6">
                {HYPOTHESES.map((h) => {
                  const heures =
                    r.detail.find((d) => d.id === h.id)?.heures ?? 0;
                  return (
                    <div key={h.id}>
                      <dt>
                        <label
                          htmlFor={`h-${h.id}`}
                          className="text-sm font-medium text-ink"
                        >
                          {h.libelle}
                        </label>
                        <p className="mt-1 text-sm text-ink-soft">{h.note}</p>
                      </dt>
                      <dd className="mt-3 flex flex-wrap items-center gap-3">
                        <input
                          id={`h-${h.id}`}
                          type="number"
                          inputMode="numeric"
                          min={h.min}
                          max={h.max}
                          step={h.pas}
                          value={hypotheses[h.id] ?? 0}
                          onChange={(e) =>
                            setHypotheses((v) => ({
                              ...v,
                              [h.id]: Math.min(
                                h.max,
                                Math.max(h.min, Number(e.target.value) || 0),
                              ),
                            }))
                          }
                          className={champ}
                        />
                        <span className="text-sm text-ink-soft">{h.unite}</span>
                        <span className="ml-auto text-sm tabular-nums text-ink-soft">
                          {formaterHeures(heures)} h / mois
                        </span>
                      </dd>
                    </div>
                  );
                })}

                {/* La part supprimable */}
                <div className="border-t border-line-soft pt-6">
                  <dt>
                    <label
                      htmlFor="part"
                      className="text-sm font-medium text-ink"
                    >
                      Part de ce temps que vous pensez pouvoir supprimer
                    </label>
                    <p className="mt-1 text-sm text-ink-soft">
                      {PART_SUPPRIMABLE.note}
                    </p>
                  </dt>
                  <dd className="mt-3 flex items-center gap-4">
                    <input
                      id="part"
                      type="range"
                      min={PART_SUPPRIMABLE.min}
                      max={PART_SUPPRIMABLE.max}
                      step={PART_SUPPRIMABLE.pas}
                      value={part}
                      onChange={(e) => setPart(Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                    <span className="w-16 text-right text-sm font-semibold tabular-nums text-ink">
                      {part} %
                    </span>
                  </dd>
                </div>

                {/* Le coût horaire */}
                <div className="border-t border-line-soft pt-6">
                  <dt>
                    <label
                      htmlFor="cout"
                      className="text-sm font-medium text-ink"
                    >
                      Coût horaire chargé
                    </label>
                    <p className="mt-1 text-sm text-ink-soft">
                      {COUT_HORAIRE.note}
                    </p>
                  </dt>
                  <dd className="mt-3 flex items-center gap-3">
                    <input
                      id="cout"
                      type="number"
                      inputMode="numeric"
                      min={COUT_HORAIRE.min}
                      max={COUT_HORAIRE.max}
                      step={COUT_HORAIRE.pas}
                      value={coutHoraire}
                      onChange={(e) =>
                        setCoutHoraire(
                          Math.min(
                            COUT_HORAIRE.max,
                            Math.max(
                              COUT_HORAIRE.min,
                              Number(e.target.value) || 0,
                            ),
                          ),
                        )
                      }
                      className={champ}
                    />
                    <span className="text-sm text-ink-soft">€ HT / heure</span>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* ══ Le résultat — deux lignes ═════════════════════════════ */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-slate-900/10 bg-slate-900 p-6 text-white">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Estimation de gains potentiels
          </h3>

          {rienSaisi ? (
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              Renseignez vos trois chiffres. Le calcul se fait à mesure, dans
              votre navigateur.
            </p>
          ) : (
            <>
              <dl className="mt-5 space-y-5" aria-live="polite">
                <div>
                  <dt className="text-sm text-white/70">
                    Vous récupérez environ
                  </dt>
                  <dd className="text-3xl font-bold tabular-nums">
                    {formaterHeures(r.heuresRecuperees)} h / mois
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-white/70">
                    À votre coût horaire, cela vaut
                  </dt>
                  <dd className="text-3xl font-bold tabular-nums">
                    {formaterEuros(r.valeur)} / mois
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-white/15 pt-5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-white/70">
                    Argon {plan.libelle}, {terrainsRetenus} terrains
                  </span>
                  <span className="tabular-nums">
                    − {formaterEuros(r.cout)}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  <span className="font-semibold">Solde potentiel</span>
                  <span
                    className={[
                      "text-lg font-bold tabular-nums",
                      r.solde >= 0 ? "text-emerald-400" : "text-rose-400",
                    ].join(" ")}
                  >
                    {r.solde >= 0 ? "+" : "−"}{" "}
                    {formaterEuros(Math.abs(r.solde))} / mois
                  </span>
                </div>
              </div>

              {/* ⚠️ La phrase qui vaut mieux qu'un ROI en pourcentage.
                  Ne pas la retirer pour « renforcer » l'argument : c'est elle
                  qui rend le reste croyable. */}
              <p className="mt-5 text-sm leading-relaxed text-white/70">
                Ce calcul ne prouve rien. Il montre l&apos;ordre de grandeur de
                ce que vous perdez aujourd&apos;hui.
              </p>
            </>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          {MENTION_SIMULATEUR}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          {MENTION_CONFIDENTIALITE}
        </p>
      </aside>
    </div>
  );
}

export default SimulateurValeur;
