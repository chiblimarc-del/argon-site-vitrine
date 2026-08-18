import { BlocProfondeur, type TroisPreuves } from "./BlocProfondeur";

/**
 * BLOC 4 — LE TABLEAU DE BORD.
 * /solutions/gestion-interventions, juste après les engagements.
 *
 * Structure particulière, arbitrée : UNE preuve dominante en pleine largeur
 * (« ce qui bloque »), puis deux preuves secondaires. Le gabarit impose trois
 * preuves ; la dominante est la première du tuple et sort du flux pour être
 * affichée seule au-dessus. Les deux autres restent en cartes.
 *
 * Pourquoi la dominante : « je sais où en est mon entreprise » n'a de valeur
 * que si le logiciel dit aussi OÙ ÇA COINCE. C'est l'argument le plus
 * distinctif du produit, et le noyer dans une grille de trois cartes égales
 * reviendrait à le perdre.
 *
 * RÈGLE DE VÉRITÉ : ce bloc décrit l'ÉTAT ACTUEL de l'activité. Interdits :
 * « personnalisable », « choisissez vos indicateurs », « configurez votre
 * vue » — la vue est fixe. Interdits également : prévision, prédiction,
 * analyse décisionnelle, « intelligence », tendance projetée.
 */

const dominante = {
  titre: "Ce qui bloque",
  citation: "7 en attente sur « Contrôle » — c'est là que ça bloque.",
  texte:
    "Argon ne se contente pas d'afficher des compteurs : il désigne l'étape où l'activité s'accumule.",
  chute: "Un retard de facturation vient rarement de la facturation.",
} as const;

const preuves: TroisPreuves = [
  {
    titre: dominante.titre,
    texte: dominante.texte,
  },
  {
    titre: "Ce qui attend",
    texte:
      "À planifier, à contrôler, à facturer : les compteurs de la chaîne, à jour.",
  },
  {
    titre: "Ce qui est rentré",
    texte:
      "Le chiffre d'affaires du mois et sa répartition, sans attendre la clôture.",
  },
];

/** Les deux preuves secondaires : le tuple moins sa dominante. */
const secondaires = preuves.slice(1);

export function TableauDeBordSection() {
  return (
    <BlocProfondeur
      tone="alt"
      eyebrow="La vue du dirigeant"
      titre="Vous ouvrez un écran, et vous savez où en est votre entreprise."
      chapo="Pas cinq onglets, pas trois personnes à appeler. L'état réel de l'activité, au moment où vous le regardez."
      preuves={preuves}
      renduPreuves="personnalise"
      frontiere={
        <>
          C&apos;est l&apos;état de votre entreprise maintenant. Ni une
          prévision, ni une analyse décisionnelle.
        </>
      }
      passerelle={{
        href: "/solutions/planning-interventions",
        libelle: "Le planning qui alimente cette vue",
      }}
    >
      {/* ---------- Preuve dominante, pleine largeur ---------- */}
      <div className="mt-14 overflow-hidden rounded-[var(--radius-card)] border border-accent/25 bg-surface">
        <div
          className={
            CAPTURE_TABLEAU_DE_BORD
              ? "grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12"
              : "p-6 sm:p-8"
          }
        >
          <div>
            {/*
              Un h3, comme les deux preuves secondaires — corrigé au contrôle
              UX du 18/08/2026. C'était un <span> : la preuve DOMINANTE du bloc
              était la seule des trois absente du plan du document. Un lecteur
              d'écran parcourant les titres de la page trouvait « ce qui
              attend » et « ce qui est rentré », jamais « ce qui bloque » —
              c'est-à-dire l'argument que ce bloc existe pour porter.
              Rendu visuel inchangé.
            */}
            <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-text">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-accent"
              />
              {dominante.titre}
            </h3>

            {/*
              Pas de guillemets extérieurs : la citation contient déjà
              « Contrôle ». Deux niveaux de guillemets français identiques ne
              se composent pas. C'est le déplacement typographique qui marque
              la citation, pas la ponctuation.
            */}
            <p className="mt-4 text-xl font-semibold leading-snug text-ink sm:text-2xl">
              {dominante.citation}
            </p>

            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
              {dominante.texte}{" "}
              <span className="font-medium text-ink">{dominante.chute}</span>
            </p>
          </div>

          <CaptureTableauDeBord />
        </div>
      </div>

      {/* ---------- Deux preuves secondaires ---------- */}
      <ul className="mt-5 grid gap-5 sm:grid-cols-2">
        {secondaires.map((preuve) => (
          <li key={preuve.titre} className="card flex flex-col p-6">
            <h3 className="text-[15px] font-semibold text-ink">{preuve.titre}</h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              {preuve.texte}
            </p>
          </li>
        ))}
      </ul>
    </BlocProfondeur>
  );
}

/**
 * EMPLACEMENT RÉSERVÉ À LA CAPTURE RÉELLE DU TABLEAU DE BORD.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * TANT QUE L'IMAGE N'EXISTE PAS, RIEN N'EST AFFICHÉ.
 *
 * Trois options étaient possibles, deux sont mauvaises :
 *   · un cadre vide en pointillés — se lit comme une image cassée ;
 *   · une interface recréée en code — deviendrait une preuve fabriquée,
 *     exactement ce que la règle de vérité du site interdit.
 * Reste la bonne : la preuve dominante occupe toute la largeur, et le bloc
 * est complet sans l'image. La capture l'améliorera, elle ne le répare pas.
 *
 * POUR ACTIVER LA CAPTURE :
 *   1. déposer l'image réelle, nettoyée de toute donnée client, dans public/
 *      (par exemple public/captures/tableau-de-bord.png) ;
 *   2. renseigner CAPTURE_TABLEAU_DE_BORD ci-dessous ;
 *   3. écrire la légende : une phrase qui DÉSIGNE ce qu'il faut regarder,
 *      jamais une description de l'écran.
 * La mise en page bascule alors d'elle-même en deux colonnes.
 *
 * L'image doit correspondre exactement au produit livré. Une capture d'une
 * version non déployée est une preuve fabriquée au même titre qu'un dessin.
 * ─────────────────────────────────────────────────────────────────────────
 */
const CAPTURE_TABLEAU_DE_BORD: {
  src: string;
  alt: string;
  legende: string;
} | null = null;

function CaptureTableauDeBord() {
  if (!CAPTURE_TABLEAU_DE_BORD) return null;

  return (
    <figure className="min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- export statique */}
      <img
        src={CAPTURE_TABLEAU_DE_BORD.src}
        alt={CAPTURE_TABLEAU_DE_BORD.alt}
        className="w-full rounded-[var(--radius-card)] border border-line"
      />
      <figcaption className="mt-3 text-[13px] leading-relaxed text-ink-muted">
        {CAPTURE_TABLEAU_DE_BORD.legende}
      </figcaption>
    </figure>
  );
}
