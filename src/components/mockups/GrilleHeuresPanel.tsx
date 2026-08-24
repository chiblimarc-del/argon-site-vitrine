/**
 * GRILLE DES HEURES — maquette
 * ============================
 *
 * Interface Argon reproduite en code, données d'illustration.
 *
 * Ce qu'elle ILLUSTRE : le mécanisme. Un congé accordé le 12 et le 13 apparaît
 * sur la grille des heures au même instant qu'il ferme le planning. Les deux
 * colonnes grisées ne sont pas une décoration : c'est la seule chose que cette
 * maquette existe pour montrer.
 *
 * Ce qu'elle ne PROUVE pas, et qu'elle ne prétend pas prouver : l'impact réel.
 * La distinction est celle de `claude/regle-editoriale.md`.
 *
 * ZÉRO JAVASCRIPT. Aucune animation — une seule chose bouge sur ce site.
 */

type Jour = {
  n: number;
  /** Heures déclarées. `null` = rien de saisi. */
  h: number | null;
  motif?: "CP" | "AT" | "REC";
  weekend?: true;
  ferie?: true;
};

type Ligne = {
  nom: string;
  role: "Salarié" | "Intérim";
  forfait: number;
  jours: readonly Jour[];
};

const j = (n: number, h: number | null, extra: Partial<Jour> = {}): Jour => ({
  n,
  h,
  ...extra,
});

const LIGNES: readonly Ligne[] = [
  {
    nom: "M. Farid",
    role: "Salarié",
    forfait: 151,
    jours: [
      j(8, 7.5),
      j(9, 8),
      j(10, 7),
      j(11, 8),
      j(12, 0, { motif: "CP" }),
      j(13, 0, { motif: "CP" }),
      j(14, null, { weekend: true }),
      j(15, null, { weekend: true }),
      j(16, 8),
      j(17, 9.5),
    ],
  },
  {
    nom: "L. Peretti",
    role: "Salarié",
    forfait: 151,
    jours: [
      j(8, 8),
      j(9, 8),
      j(10, 0, { motif: "AT" }),
      j(11, 0, { motif: "AT" }),
      j(12, 4, { motif: "AT" }),
      j(13, 8),
      j(14, null, { weekend: true }),
      j(15, null, { weekend: true }),
      j(16, 8),
      j(17, 8),
    ],
  },
];

const COULEUR_MOTIF: Record<NonNullable<Jour["motif"]>, string> = {
  CP: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  AT: "bg-amber-50 text-amber-800 ring-amber-200",
  REC: "bg-slate-100 text-slate-700 ring-slate-200",
};

const LIBELLE_MOTIF: Record<NonNullable<Jour["motif"]>, string> = {
  CP: "Congé payé",
  AT: "Arrêt de travail",
  REC: "Récupération",
};

function Cellule({ jour }: { jour: Jour }) {
  if (jour.weekend) {
    return (
      <td className="border-b border-l border-slate-100 bg-slate-50/70 p-0 text-center">
        <span className="sr-only">Week-end</span>
        <span aria-hidden="true" className="block py-2 text-xs text-slate-300">
          ·
        </span>
      </td>
    );
  }

  if (jour.motif) {
    return (
      <td className="border-b border-l border-slate-100 p-1 text-center align-middle">
        <span
          className={`flex h-9 flex-col items-center justify-center rounded ring-1 ${COULEUR_MOTIF[jour.motif]}`}
        >
          <span className="text-[10px] font-bold leading-none">
            {jour.motif}
          </span>
          {jour.h !== null && jour.h > 0 && (
            <span className="mt-0.5 text-[10px] leading-none tabular-nums opacity-80">
              {jour.h} h
            </span>
          )}
        </span>
        <span className="sr-only">
          {LIBELLE_MOTIF[jour.motif]}
          {jour.h ? `, ${jour.h} heures travaillées` : ""}
        </span>
      </td>
    );
  }

  return (
    <td className="border-b border-l border-slate-100 py-2 text-center text-sm tabular-nums text-slate-700">
      {jour.h ?? "—"}
    </td>
  );
}

export function GrilleHeuresPanel() {
  const entetes = LIGNES[0].jours;

  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Barre de fenêtre */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">
          Heures — mars
          <span className="ml-2 font-normal text-slate-500">Salariés</span>
        </p>
        <p className="hidden text-xs text-slate-500 sm:block">
          Grille bureau · même donnée que l&apos;appli terrain
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse">
          <caption className="sr-only">
            Grille mensuelle des heures. Le congé accordé de M. Farid apparaît
            sur les 12 et 13 sans avoir été ressaisi.
          </caption>

          <thead>
            <tr className="bg-white">
              <th
                scope="col"
                className="border-b border-slate-200 py-2 pl-4 pr-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              >
                Technicien
              </th>
              {entetes.map((e) => (
                <th
                  key={e.n}
                  scope="col"
                  className={`border-b border-l border-slate-100 py-2 text-center text-[11px] font-medium tabular-nums ${
                    e.weekend ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {e.n}
                </th>
              ))}
              <th
                scope="col"
                className="border-b border-l border-slate-200 py-2 pl-3 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              >
                Solde
              </th>
            </tr>
          </thead>

          <tbody>
            {LIGNES.map((ligne) => {
              const total = ligne.jours.reduce((s, x) => s + (x.h ?? 0), 0);
              return (
                <tr key={ligne.nom}>
                  <th
                    scope="row"
                    className="border-b border-slate-100 py-2 pl-4 pr-3 text-left"
                  >
                    <span className="block text-sm font-medium text-slate-900">
                      {ligne.nom}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      forfait {ligne.forfait} h
                    </span>
                  </th>

                  {ligne.jours.map((jour) => (
                    <Cellule key={jour.n} jour={jour} />
                  ))}

                  <td className="border-b border-l border-slate-200 py-2 pl-3 pr-4 text-right text-sm font-semibold tabular-nums text-slate-900">
                    {total} h
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ce que la grille dit d'elle-même */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">
            Les 12 et 13 n&apos;ont été saisis nulle part.
          </span>{" "}
          Le congé a été demandé depuis le mobile et accordé depuis le bureau.
          Au même instant, le technicien est devenu non planifiable et le motif
          est apparu ici.
        </p>
      </div>

      <figcaption className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
        Interface Argon reproduite en code — données d&apos;illustration.
      </figcaption>
    </figure>
  );
}

export default GrilleHeuresPanel;
