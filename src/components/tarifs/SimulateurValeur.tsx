"use client";

/**
 * SIMULATEUR DE VALEUR
 * ====================
 *
 * C'est la section qui justifie la page : le palier d'engagement intermédiaire
 * qui manquait au site. Un visiteur convaincu à 60 % pouvait seulement demander
 * une démonstration avec cinq champs obligatoires dont son téléphone. Il peut
 * désormais manipuler un chiffre sans se nommer.
 *
 * LA RÈGLE TENUE ICI :
 *   Le visiteur fournit les hypothèses. Argon ne fournit que l'arithmétique.
 *
 * Concrètement, et sans exception :
 *   · aucun coefficient caché — chaque part supprimée est un curseur visible ;
 *   · chaque hypothèse est affichée À CÔTÉ de son résultat, pas en note ;
 *   · aucun chiffre d'exemple en dur — tout vient des champs ;
 *   · un solde négatif s'affiche, il ne se masque pas ;
 *   · rien ne quitte le navigateur, et la page le dit.
 *
 * Progressif : trois questions d'abord, le reste dépliable. Onze champs d'un
 * bloc recréeraient la friction que ce simulateur existe pour supprimer.
 */

import { useMemo, useState } from "react";
import {
  CAPACITE,
  COUT_HORAIRE,
  LEVIERS_TEMPS,
  LEVIER_DEPENSES,
  MENTION_CONFIDENTIALITE,
  MENTION_SIMULATEUR,
  formaterEuros,
  formaterHeures,
  formaterNombre,
  planParId,
  prixMensuel,
  type IdPlan,
} from "@/lib/tarifs";

type EtatLevier = { valeur: number; part: number };

export function SimulateurValeur({
  planRetenu = "business",
  terrainsRetenus = 12,
}: {
  planRetenu?: IdPlan;
  terrainsRetenus?: number;
}) {
  /* ── État ─────────────────────────────────────────────────── */

  const [temps, setTemps] = useState<Record<string, EtatLevier>>(() =>
    Object.fromEntries(
      LEVIERS_TEMPS.map((l) => [
        l.id,
        { valeur: l.defaut, part: l.partReduiteDefaut },
      ]),
    ),
  );

  const [coutHoraire, setCoutHoraire] = useState(COUT_HORAIRE.defaut);
  const [avance, setAvance] = useState(false);

  const [depenses, setDepenses] = useState<EtatLevier>({
    valeur: LEVIER_DEPENSES.defaut,
    part: LEVIER_DEPENSES.partReduiteDefaut,
  });

  const [interventions, setInterventions] = useState(CAPACITE.interventionsDefaut);
  const [valeurIntervention, setValeurIntervention] = useState(
    CAPACITE.valeurMoyenneDefaut,
  );
  const [partReaffectee, setPartReaffectee] = useState(
    CAPACITE.partReaffecteeDefaut,
  );

  /* ── Arithmétique — et rien d'autre ───────────────────────── */

  const r = useMemo(() => {
    const parLevier = LEVIERS_TEMPS.map((l) => {
      const e = temps[l.id];
      const heuresMois = e.valeur * l.parMois;
      const heuresRecuperees = heuresMois * (e.part / 100);
      return {
        levier: l,
        heuresMois,
        heuresRecuperees,
        euros: heuresRecuperees * coutHoraire,
      };
    });

    const heuresRecuperees = parLevier.reduce((s, x) => s + x.heuresRecuperees, 0);
    const valeurTemps = heuresRecuperees * coutHoraire;

    const heuresComptables =
      parLevier.find((x) => x.levier.id === "comptable")?.heuresRecuperees ?? 0;

    const valeurDepenses = avance
      ? depenses.valeur * (depenses.part / 100)
      : 0;

    // Le temps ne devient de la capacité que s'il est réaffecté à de la
    // production. Le visiteur dit quelle part il compte réaffecter.
    const heuresParIntervention =
      interventions > 0
        ? // durée moyenne implicite, dérivée du temps administratif déclaré
          Math.max(0.25, heuresRecuperees / Math.max(1, interventions))
        : 0;

    const interventionsSupp = avance
      ? Math.floor(
          (heuresRecuperees * (partReaffectee / 100)) /
            Math.max(0.25, heuresParIntervention || 1),
        )
      : 0;

    const capaciteCommerciale = avance
      ? interventionsSupp * valeurIntervention
      : 0;

    const valeurTotale = valeurTemps + valeurDepenses;

    const plan = planParId(planRetenu);
    const coutArgon = prixMensuel(plan, terrainsRetenus);
    const solde = valeurTotale - coutArgon;
    const roi = coutArgon > 0 ? (solde / coutArgon) * 100 : 0;

    return {
      parLevier,
      heuresRecuperees,
      heuresComptables,
      valeurTemps,
      valeurDepenses,
      valeurTotale,
      interventionsSupp,
      capaciteCommerciale,
      plan,
      coutArgon,
      solde,
      roi,
    };
  }, [
    temps,
    coutHoraire,
    avance,
    depenses,
    interventions,
    valeurIntervention,
    partReaffectee,
    planRetenu,
    terrainsRetenus,
  ]);

  const majLevier = (id: string, patch: Partial<EtatLevier>) =>
    setTemps((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  /* ── Rendu ────────────────────────────────────────────────── */

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      {/* ══ Les questions ══════════════════════════════════════ */}
      <div className="space-y-8">
        {LEVIERS_TEMPS.map((l) => {
          const e = temps[l.id];
          const res = r.parLevier.find((x) => x.levier.id === l.id)!;

          return (
            <fieldset
              key={l.id}
              className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            >
              <legend className="px-1 text-sm font-semibold text-ink">
                {l.question}
              </legend>
              <p className="mt-1 text-sm text-ink-soft">{l.note}</p>

              <div className="mt-5 flex items-center gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  min={l.min}
                  max={l.max}
                  step={l.pas}
                  value={e.valeur}
                  onChange={(ev) =>
                    majLevier(l.id, {
                      valeur: Math.min(
                        l.max,
                        Math.max(l.min, Number(ev.target.value) || 0),
                      ),
                    })
                  }
                  aria-label={l.question}
                  className="h-11 w-24 rounded-lg border border-line text-center text-lg font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
                <span className="text-sm text-ink-soft">{l.unite}</span>
              </div>

              {/* L'hypothèse — visible, modifiable, jamais cachée */}
              <div className="mt-5 border-t border-line-soft pt-5">
                <label
                  htmlFor={`part-${l.id}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-ink-soft"
                >
                  <span>Sur ce temps, quelle part pensez-vous supprimer ?</span>
                  <strong className="tabular-nums text-ink">
                    {e.part} %
                  </strong>
                </label>
                <input
                  id={`part-${l.id}`}
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={e.part}
                  onChange={(ev) =>
                    majLevier(l.id, { part: Number(ev.target.value) })
                  }
                  className="mt-2 w-full accent-[--color-accent]"
                />
                <p className="mt-2 text-sm text-ink-soft tabular-nums" aria-live="polite">
                  Soit <strong>{formaterHeures(res.heuresRecuperees)} h</strong> par
                  mois, valorisées {formaterEuros(res.euros)}.
                </p>
              </div>
            </fieldset>
          );
        })}

        {/* Coût horaire */}
        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <label
            htmlFor="cout-horaire"
            className="block text-sm font-semibold text-ink"
          >
            Coût horaire chargé moyen
          </label>
          <p className="mt-1 text-sm text-ink-soft">{COUT_HORAIRE.note}</p>
          <div className="mt-4 flex items-center gap-3">
            <input
              id="cout-horaire"
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
                    Math.max(COUT_HORAIRE.min, Number(e.target.value) || 0),
                  ),
                )
              }
              className="h-11 w-24 rounded-lg border border-line text-center text-lg font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
            <span className="text-sm text-ink-soft">€ / heure</span>
          </div>
        </div>

        {/* ── Le reste, dépliable ─────────────────────────────── */}
        <div>
          <button
            type="button"
            onClick={() => setAvance((v) => !v)}
            aria-expanded={avance}
            aria-controls="leviers-avances"
            className="w-full rounded-xl border border-dashed border-line px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {avance
              ? "Masquer les dépenses et la capacité"
              : "Aller plus loin : dépenses évitables et capacité de production"}
          </button>

          {avance && (
            <div id="leviers-avances" className="mt-6 space-y-8">
              {/* Dépenses */}
              <fieldset className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                <legend className="px-1 text-sm font-semibold text-ink">
                  {LEVIER_DEPENSES.question}
                </legend>
                <p className="mt-1 text-sm text-ink-soft">
                  {LEVIER_DEPENSES.note}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={LEVIER_DEPENSES.min}
                    max={LEVIER_DEPENSES.max}
                    step={LEVIER_DEPENSES.pas}
                    value={depenses.valeur}
                    onChange={(e) =>
                      setDepenses((d) => ({
                        ...d,
                        valeur: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    aria-label={LEVIER_DEPENSES.question}
                    className="h-11 w-32 rounded-lg border border-line text-center text-lg font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  />
                  <span className="text-sm text-ink-soft">€ / mois</span>
                </div>

                <div className="mt-5 border-t border-line-soft pt-5">
                  <label
                    htmlFor="part-depenses"
                    className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-ink-soft"
                  >
                    <span>
                      Quelle part estimez-vous évitable en voyant mieux ce qui
                      part ?
                    </span>
                    <strong className="tabular-nums text-ink">
                      {depenses.part} %
                    </strong>
                  </label>
                  <input
                    id="part-depenses"
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={depenses.part}
                    onChange={(e) =>
                      setDepenses((d) => ({ ...d, part: Number(e.target.value) }))
                    }
                    className="mt-2 w-full accent-[--color-accent]"
                  />
                  <p
                    className="mt-2 text-sm text-ink-soft tabular-nums"
                    aria-live="polite"
                  >
                    Soit <strong>{formaterEuros(r.valeurDepenses)}</strong> par
                    mois.
                  </p>
                </div>
              </fieldset>

              {/* Capacité */}
              <fieldset className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                <legend className="px-1 text-sm font-semibold text-ink">
                  Capacité de production
                </legend>
                <p className="mt-1 text-sm text-ink-soft">{CAPACITE.note}</p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="interventions"
                      className="block text-sm text-ink-soft"
                    >
                      Interventions par mois
                    </label>
                    <input
                      id="interventions"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={interventions}
                      onChange={(e) =>
                        setInterventions(Math.max(0, Number(e.target.value) || 0))
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-line px-3 text-lg font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="valeur-intervention"
                      className="block text-sm text-ink-soft"
                    >
                      Valeur moyenne d&apos;une intervention (€)
                    </label>
                    <input
                      id="valeur-intervention"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={valeurIntervention}
                      onChange={(e) =>
                        setValeurIntervention(
                          Math.max(0, Number(e.target.value) || 0),
                        )
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-line px-3 text-lg font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    />
                  </div>
                </div>

                <div className="mt-5 border-t border-line-soft pt-5">
                  <label
                    htmlFor="part-reaffectee"
                    className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-ink-soft"
                  >
                    <span>Quelle part du temps récupéré réaffectez-vous ?</span>
                    <strong className="tabular-nums text-ink">
                      {partReaffectee} %
                    </strong>
                  </label>
                  <input
                    id="part-reaffectee"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={partReaffectee}
                    onChange={(e) => setPartReaffectee(Number(e.target.value))}
                    className="mt-2 w-full accent-[--color-accent]"
                  />
                </div>
              </fieldset>
            </div>
          )}
        </div>
      </div>

      {/* ══ Le résultat ════════════════════════════════════════ */}
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-2xl border border-ink/10 bg-ink p-6 text-surface">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Estimation de gains potentiels
          </h3>

          <dl className="mt-5 space-y-4" aria-live="polite">
            <div>
              <dt className="text-sm text-white/70">
                Temps potentiellement récupéré
              </dt>
              <dd className="text-2xl font-bold tabular-nums">
                {formaterHeures(r.heuresRecuperees)} h / mois
              </dd>
            </div>

            <div>
              <dt className="text-sm text-white/70">
                Valeur potentielle identifiée
              </dt>
              <dd className="text-2xl font-bold tabular-nums">
                {formaterEuros(r.valeurTotale)} / mois
              </dd>
            </div>

            <div>
              <dt className="text-sm text-white/70">
                Temps comptable potentiellement récupéré
              </dt>
              <dd className="text-lg font-semibold tabular-nums">
                {formaterHeures(r.heuresComptables)} h / mois
              </dd>
            </div>

            {avance && (
              <div>
                <dt className="text-sm text-white/70">
                  Capacité supplémentaire potentielle
                </dt>
                <dd className="text-lg font-semibold tabular-nums">
                  + {formaterNombre(r.interventionsSupp)} interventions / mois
                  {r.capaciteCommerciale > 0 && (
                    <span className="block text-sm font-normal text-white/70">
                      soit {formaterEuros(r.capaciteCommerciale)} de capacité
                      commerciale
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6 space-y-2 border-t border-white/15 pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-white/70">
                Argon {r.plan.libelle}, {terrainsRetenus} terrain
                {terrainsRetenus > 1 ? "s" : ""}
              </span>
              <span className="font-semibold tabular-nums">
                − {formaterEuros(r.coutArgon)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-base">
              <span className="font-semibold">Solde potentiel</span>
              <span
                className={[
                  "font-bold tabular-nums",
                  r.solde >= 0 ? "text-emerald-300" : "text-amber-300",
                ].join(" ")}
              >
                {r.solde >= 0 ? "+" : "−"}
                {formaterEuros(Math.abs(r.solde))} / mois
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-white/70">Retour potentiel</span>
              <span className="font-semibold tabular-nums">
                {r.roi >= 0 ? "+" : ""}
                {formaterNombre(r.roi)} %
              </span>
            </div>
          </div>

          {/* Un solde négatif s'affiche. Il ne se masque pas. */}
          {r.solde < 0 && (
            <p className="mt-4 rounded-lg bg-surface/10 px-4 py-3 text-sm text-white/90">
              Avec ces hypothèses, Argon coûte plus qu&apos;il ne vous fait gagner.
              C&apos;est une réponse utile : dites-le-nous, et nous vous dirons
              franchement si c&apos;est le bon moment.
            </p>
          )}

          <p className="mt-4 text-xs text-white/60">
            Traçabilité : demandes, interventions, comptes rendus et facturation
            centralisés. Ce bénéfice n&apos;est pas valorisé ci-dessus.
          </p>

          <a
            href="/demander-une-demo"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-surface px-5 font-semibold text-ink transition-colors hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Vérifions ces chiffres ensemble
          </a>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          {MENTION_SIMULATEUR}
        </p>
        <p className="mt-2 text-xs font-medium text-ink-soft">
          {MENTION_CONFIDENTIALITE}
        </p>
      </aside>
    </div>
  );
}
