/**
 * ENCOURS CLIENT — maquette
 * =========================
 *
 * Interface Argon reproduite en code, données d'illustration.
 *
 * Ce qu'elle ILLUSTRE : la lecture par tranches d'ancienneté. Un total de
 * créances ne dit rien ; le même total réparti entre « moins de 30 jours » et
 * « plus de 60 » dit s'il faut appeler sa banque ou appeler ses clients.
 *
 * Ce qu'elle ne PROUVE pas : l'effet sur la trésorerie réelle. Voir la
 * distinction illustrer / prouver dans `claude/regle-editoriale.md`.
 *
 * ⚠️ LES CHIFFRES SONT DES DONNÉES D'ILLUSTRATION, PAS UNE STATISTIQUE.
 * Aucun ne doit jamais être repris dans un texte comme un ordre de grandeur
 * observé chez des clients. « Aucun chiffre fabriqué » vaut aussi ici.
 *
 * ZÉRO JAVASCRIPT. Aucune animation.
 */

const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

type Tranche = {
  libelle: string;
  montant: number;
  /** Part du total, en %. Sert la barre — jamais affichée comme un chiffre. */
  part: number;
  ton: "ok" | "attention" | "alerte";
};

const TRANCHES: readonly Tranche[] = [
  { libelle: "Moins de 30 jours", montant: 18400, part: 54, ton: "ok" },
  { libelle: "De 30 à 60 jours", montant: 9750, part: 29, ton: "attention" },
  { libelle: "Plus de 60 jours", montant: 5820, part: 17, ton: "alerte" },
];

const TOTAL = TRANCHES.reduce((s, t) => s + t.montant, 0);
const EN_RETARD = TRANCHES.filter((t) => t.ton !== "ok").reduce(
  (s, t) => s + t.montant,
  0,
);

const BARRE: Record<Tranche["ton"], string> = {
  ok: "bg-emerald-500",
  attention: "bg-amber-500",
  alerte: "bg-rose-500",
};

const PASTILLE: Record<Tranche["ton"], string> = {
  ok: "bg-emerald-500",
  attention: "bg-amber-500",
  alerte: "bg-rose-500",
};

const CLIENTS = [
  { nom: "Résidence Les Tilleuls", montant: 4200, retard: 74 },
  { nom: "SCI Bellevue", montant: 1620, retard: 63 },
  { nom: "Groupe Marchand", montant: 3100, retard: 41 },
] as const;

export function EncoursPanel() {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="border-b border-line bg-surface-alt px-5 py-3">
        <p className="text-sm font-semibold text-ink">Encours client</p>
      </div>

      {/* Les deux chiffres qu'on regarde en premier */}
      <div className="grid grid-cols-2 divide-x divide-line-soft border-b border-line-soft">
        <div className="px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            Reste dû
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
            {euros.format(TOTAL)}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            Dont en retard
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-rose-600">
            {euros.format(EN_RETARD)}
          </p>
        </div>
      </div>

      {/* L'ancienneté par tranches — l'argument de la maquette */}
      <div className="px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Par ancienneté
        </p>

        {/* Barre unique, empilée */}
        <div
          className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-alt"
          role="img"
          aria-label={`Répartition de l'encours : ${TRANCHES.map((t) => `${t.libelle}, ${euros.format(t.montant)}`).join(" ; ")}`}
        >
          {TRANCHES.map((t) => (
            <span
              key={t.libelle}
              className={BARRE[t.ton]}
              style={{ width: `${t.part}%` }}
            />
          ))}
        </div>

        <dl className="mt-4 space-y-2">
          {TRANCHES.map((t) => (
            <div
              key={t.libelle}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="flex items-center gap-2 text-sm text-ink-soft">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${PASTILLE[t.ton]}`}
                />
                {t.libelle}
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-ink">
                {euros.format(t.montant)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Ce qui rend la tranche actionnable : les noms */}
      <div className="border-t border-line-soft px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Les plus anciennes
        </p>
        <ul className="mt-3 space-y-2">
          {CLIENTS.map((c) => (
            <li
              key={c.nom}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <span className="truncate text-ink-soft">{c.nom}</span>
              <span className="shrink-0 tabular-nums text-ink-soft">
                <span className="font-semibold text-ink">
                  {euros.format(c.montant)}
                </span>
                <span className="ml-2">{c.retard} j</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="border-t border-line-soft bg-surface-alt px-5 py-2 text-xs text-ink-soft">
        Interface Argon reproduite en code — données d&apos;illustration.
      </figcaption>
    </figure>
  );
}
