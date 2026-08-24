"use client";

/**
 * SIMULATEUR DE PRIX
 * ==================
 *
 * Écart assumé avec le cadrage V1, et c'est l'optimisation principale :
 * le cadrage demandait « choisir un forfait, puis calculer ». Ici, un seul
 * réglage — le nombre d'utilisateurs terrain — et LES TROIS PRIX bougent
 * ensemble.
 *
 * Trois raisons :
 *   1. c'est un geste au lieu de deux ;
 *   2. le visiteur compare au lieu de calculer, et c'est ce qu'il veut faire ;
 *   3. ça rend visible le POINT DE BASCULE — le nombre d'utilisateurs à partir
 *      duquel l'offre supérieure coûte moins cher. Le dire avant que le client
 *      ne le découvre est exactement le ton du site.
 *
 * Calcul intégralement local. Aucun appel réseau, ni au chargement, ni à la
 * saisie. La page fonctionne sans compte et sans connexion à quoi que ce soit.
 */

import { useMemo, useState } from "react";
import {
  PLANS,
  PLAN_PAR_DEFAUT,
  formaterEuros,
  formaterNombre,
  pointDeBascule,
  prixAnnuel,
  prixMensuel,
  type IdPlan,
} from "@/lib/tarifs";

const MIN = 1;
const MAX = 200;

export function SimulateurPrix({
  onChoixPlan,
}: {
  /** Remonte le forfait retenu au simulateur de valeur, s'il est monté. */
  onChoixPlan?: (id: IdPlan, terrains: number) => void;
}) {
  const [terrains, setTerrains] = useState(12);
  const [retenu, setRetenu] = useState<IdPlan>(PLAN_PAR_DEFAUT);

  const majTerrains = (v: number) => {
    const n = Math.min(MAX, Math.max(MIN, Math.round(v || 0)));
    setTerrains(n);
    onChoixPlan?.(retenu, n);
  };

  const majRetenu = (id: IdPlan) => {
    setRetenu(id);
    onChoixPlan?.(id, terrains);
  };

  const bascules = useMemo(
    () =>
      [
        { de: PLANS[0], vers: PLANS[1], seuil: pointDeBascule(PLANS[0], PLANS[1]) },
        { de: PLANS[1], vers: PLANS[2], seuil: pointDeBascule(PLANS[1], PLANS[2]) },
      ].filter(
        (b): b is { de: (typeof PLANS)[number]; vers: (typeof PLANS)[number]; seuil: number } =>
          b.seuil !== null,
      ),
    [],
  );

  const basculeAtteinte = bascules.find((b) => terrains >= b.seuil);
  const basculeProche = bascules.find((b) => terrains < b.seuil && terrains >= b.seuil - 10);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
      {/* ── Le réglage ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label
            htmlFor="terrains"
            className="block text-sm font-medium text-ink"
          >
            Combien d&apos;utilisateurs terrain actifs ?
          </label>
          <p className="mt-1 text-sm text-ink-soft">
            Vos utilisateurs bureau sont inclus, quel que soit leur nombre.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => majTerrains(terrains - 1)}
            disabled={terrains <= MIN}
            aria-label="Un utilisateur terrain de moins"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-xl text-ink-soft transition-colors hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>

          <input
            id="terrains"
            type="number"
            inputMode="numeric"
            min={MIN}
            max={MAX}
            value={terrains}
            onChange={(e) => majTerrains(Number(e.target.value))}
            className="h-11 w-20 rounded-lg border border-line text-center text-lg font-semibold tabular-nums text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />

          <button
            type="button"
            onClick={() => majTerrains(terrains + 1)}
            disabled={terrains >= MAX}
            aria-label="Un utilisateur terrain de plus"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-xl text-ink-soft transition-colors hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <input
        type="range"
        min={MIN}
        max={60}
        value={Math.min(terrains, 60)}
        onChange={(e) => majTerrains(Number(e.target.value))}
        aria-label="Nombre d'utilisateurs terrain actifs"
        className="mt-6 w-full accent-[--color-accent]"
      />

      {/* ── Les trois prix, ensemble ───────────────────────────── */}
      <div
        className="mt-8 grid gap-3 sm:grid-cols-3"
        role="group"
        aria-label="Prix mensuel des trois offres"
      >
        {PLANS.map((plan) => {
          const actif = plan.id === retenu;
          const mensuel = prixMensuel(plan, terrains);

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => majRetenu(plan.id)}
              aria-pressed={actif}
              className={[
                "rounded-xl border p-4 text-left transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                actif
                  ? "border-accent bg-accent/5 ring-1 ring-accent"
                  : "border-line hover:border-line hover:bg-surface-alt",
              ].join(" ")}
            >
              <span className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink">
                  {plan.libelle}
                </span>
                {plan.recommande && (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                    Recommandé
                  </span>
                )}
              </span>

              <span className="mt-2 block text-2xl font-bold tabular-nums text-ink">
                {formaterEuros(mensuel)}
                <span className="ml-1 text-sm font-normal text-ink-soft">
                  HT / mois
                </span>
              </span>

              <span className="mt-1 block text-xs text-ink-soft tabular-nums">
                {formaterEuros(plan.plateforme)} + {terrains} ×{" "}
                {formaterEuros(plan.terrain)}
              </span>

              <span className="mt-2 block text-xs text-ink-soft tabular-nums">
                soit {formaterEuros(prixAnnuel(plan, terrains))} HT / an
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Le point de bascule ────────────────────────────────── */}
      {(basculeAtteinte || basculeProche) && (
        <p
          className="mt-6 rounded-lg bg-surface-alt px-4 py-3 text-sm text-ink-soft"
          aria-live="polite"
        >
          {basculeAtteinte ? (
            <>
              À partir de{" "}
              <strong className="tabular-nums">
                {formaterNombre(basculeAtteinte.seuil)} utilisateurs terrain
              </strong>
              , l&apos;offre {basculeAtteinte.vers.libelle} revient moins cher que{" "}
              {basculeAtteinte.de.libelle} — et elle en fait davantage. Vous y
              êtes.
            </>
          ) : (
            <>
              À partir de{" "}
              <strong className="tabular-nums">
                {formaterNombre(basculeProche!.seuil)} utilisateurs terrain
              </strong>
              , l&apos;offre {basculeProche!.vers.libelle} reviendra moins cher que{" "}
              {basculeProche!.de.libelle}. Autant le savoir maintenant.
            </>
          )}
        </p>
      )}

      <p className="mt-4 text-xs text-ink-soft">
        Prix hors taxes, hors mise en service, options et consommations. Le
        détail figure plus bas sur cette page.
      </p>
    </div>
  );
}
