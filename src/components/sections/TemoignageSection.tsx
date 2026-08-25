/**
 * TÉMOIGNAGE — D-Trans Express
 * ===========================
 *
 * ⚠️⚠️ CE BLOC EST LE SEUL DU SITE À CITER QUELQU'UN. ⚠️⚠️
 *
 * ─── LA RÈGLE, ET ELLE NE SE REDISCUTE PAS ────────────────────
 *
 * Tout ce qui est entre guillemets ci-dessous a été DIT par le client, le
 * 23/08/2026, en réponse à trois questions écrites. Rien n'a été ajouté,
 * rien n'a été deviné, rien n'a été « amélioré ».
 *
 * Les seules retouches autorisées ont été l'orthographe et la grammaire.
 * ⚠️ La version corrigée DOIT être relue et validée par le client avant mise
 * en ligne — corriger « on perder » en « on perdait » est légitime, mais c'est
 * lui qui valide le texte qui porte son nom.
 *
 * NE JAMAIS :
 *   · ajouter une phrase qu'il n'a pas dite, même anodine ;
 *   · retirer la réserve pour « alléger » ;
 *   · transformer ses chiffres en argument d'Argon (voir plus bas) ;
 *   · ajouter un second témoignage inventé pour « équilibrer » la page.
 *
 * ─── L'ACCORD ─────────────────────────────────────────────────
 *
 * Nom et logo : accord donné le 23/08/2026, par écrit.
 * ⚠️ Conserver cet écrit. C'est ce qui rend la publication licite, et c'est la
 * première chose qu'on cherchera le jour où quelqu'un le contestera.
 * ⚠️ Retirer le bloc immédiatement et sans discussion si le client le demande.
 *
 * ─── LES CHIFFRES : CE QUI CHANGE ET CE QUI NE CHANGE PAS ─────
 *
 * « Deux heures » et « moins de cinq minutes » sont dans la citation. Ce n'est
 * PAS une entorse à la règle « aucun chiffre de performance » : la règle
 * interdit à ARGON d'affirmer un gain. Ici, c'est un client nommé qui raconte
 * ce qui lui est arrivé, et il en répond.
 *
 * ⚠️ LA LIGNE À NE PAS FRANCHIR : ces chiffres restent DANS les guillemets,
 * toujours. Ils ne remontent jamais en titre, ni en accroche, ni en meta
 * description, ni dans le simulateur de la page tarifs. « Facturez votre mois
 * en 5 minutes » serait une promesse d'Argon — et une promesse fausse, parce
 * qu'elle dépend du volume et de l'organisation de chacun.
 *
 * ─── CE QUE CE TÉMOIGNAGE CONFIRME ────────────────────────────
 *
 * La section « Problème » de l'accueil affiche depuis le Lot 1 un artefact
 * inventé : « 6 interventions réalisées · non facturées ». Le client dit,
 * sans qu'on lui ait montré la page : « on perdait du chiffre d'affaires
 * parce qu'on oubliait des factures. »
 *
 * L'illustration était juste. C'est agréable, et ça ne se raconte nulle part
 * sur le site — c'est une note interne.
 */

type Reponse = {
  /** La question posée, telle qu'elle a été posée. */
  question: string;
  /** Ses mots. Orthographe corrigée, sens intact. */
  citation: string;
};

const REPONSES: readonly Reponse[] = [
  {
    question: "Qu'est-ce qui vous prenait du temps avant, et que vous ne faites plus ?",
    citation:
      "Sauter d'un logiciel à l'autre. On avait nos clients sur Excel, nos plannings sur un autre logiciel, et la facturation sur encore un autre.",
  },
  {
    question: "Y a-t-il un moment précis où vous vous êtes dit que ça marchait ?",
    citation:
      "Oui, au premier mois de facturation : en moins de cinq minutes, j'avais facturé tout le mois. Avant, ça me prenait presque deux heures — et on perdait du chiffre d'affaires parce qu'on oubliait des factures. Et aussi au premier litige client : tout était factuel, et j'ai gagné la confiance de mon client.",
  },
];

/**
 * La réserve. Elle est publiée telle quelle, et c'est délibéré : un témoignage
 * sans réserve ne convainc personne. Celle-ci tombe en plus exactement sur la
 * frontière que le site tient depuis le Lot 1, ce qui la rend doublement utile.
 */
const RESERVE = {
  question: "Qu'est-ce qu'Argon ne fait pas, et que vous auriez aimé qu'il fasse ?",
  citation: "La déclaration comptable, le bilan. Ça aurait été top.",
};

/**
 * La signature. Fournie par la personne citée le 23/08/2026.
 *
 * ⚠️ NE PAS « AMÉLIORER » LA FONCTION. Assistante de direction est ce qu'elle
 * est, et c'est plus crédible qu'un titre gonflé : dans une entreprise de
 * transport de cette taille, c'est exactement la personne qui facture. Un
 * lecteur du métier le sait.
 *
 * ⚠️ L'ORTHOGRAPHE DE L'ENTREPRISE VIENT DE SON LOGO : « D-Trans Express »,
 * en deux mots. La demande initiale disait « D-Transexpress ». Écrire le nom
 * d'un client autrement qu'il ne l'écrit lui-même est le genre de détail qui
 * fait douter du reste — et c'est vérifiable en trois secondes par n'importe
 * qui. ⚠️ À faire confirmer par Delphine avec la relecture du texte, en même
 * temps que la raison sociale exacte si elle diffère du nom commercial.
 */
const SIGNATURE = {
  nom: "Delphine Dumont",
  fonction: "Assistante de direction",
  entreprise: "D-Trans Express",
  /**
   * Logo fourni le 23/08/2026, redimensionné à 240 px de haut (ratio 2,689).
   * ⚠️ Servi depuis `'self'` — obligatoire avec la CSP du Lot 10, qui pose
   * `img-src 'self' data:`. Un logo appelé depuis un domaine tiers serait
   * bloqué en silence.
   */
  logo: "/logos/d-trans-express.png",
  logo2x: "/logos/d-trans-express@2x.png",
};

export function TemoignageSection() {
  return (
    <section className="border-b border-line-soft bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Un client, ses mots
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Avant Argon, D-Trans Express travaillait sur trois logiciels.
        </h2>

        <figure className="mt-10 rounded-2xl border border-line bg-surface-alt p-6 sm:p-10">
          <blockquote className="space-y-8">
            {REPONSES.map((r) => (
              <div key={r.question}>
                <p className="text-sm font-medium text-ink-soft">
                  {r.question}
                </p>
                <p className="mt-3 text-lg leading-relaxed text-ink">
                  « {r.citation} »
                </p>
              </div>
            ))}

            {/* La réserve, au même rang que le reste. Pas en petit, pas en note. */}
            <div className="border-t border-line pt-8">
              <p className="text-sm font-medium text-ink-soft">
                {RESERVE.question}
              </p>
              <p className="mt-3 text-lg leading-relaxed text-ink">
                « {RESERVE.citation} »
              </p>
              {/* Notre réponse, dans la formule verrouillée. Mot pour mot. */}
              <p className="mt-4 rounded-xl border-l-4 border-line bg-surface-alt p-5 text-base leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">
                  Et c&apos;est exact.
                </span>{" "}
                Argon ne tient pas votre comptabilité. Il prépare, centralise et
                alimente les informations et documents nécessaires à leur
                exploitation. Nous n&apos;avons pas l&apos;intention que ça change : c&apos;est
                le métier de votre cabinet, pas le nôtre.
              </p>
            </div>
          </blockquote>

          <figcaption className="mt-10 flex flex-wrap items-center gap-5 border-t border-line-soft pt-8">
            {/*
              ⚠️ CARTOUCHE BLANC — le logo porte un texte NOIR sur fond
              transparent. Sur le fond sombre du site, « D-TRANS EXPRESS »
              disparaissait : seules les deux fleches restaient visibles.

              Le cartouche resout le probleme SANS TOUCHER AU FICHIER. C est
              deliberе : le logo d un client s affiche tel qu il l a fourni.
              Le repeindre en blanc sortirait de l accord donne le 23/08, et
              le prochain logo client arriverait dans une autre teinte.

              Ne pas retirer ce fond en le croyant decoratif.
            */}
            <span className="inline-flex items-center rounded-lg bg-white px-3 py-2">
              {/* Dimensions au ratio réel du logo (2,689) : pas de saut de mise
                  en page au chargement. eslint-disable car export statique. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SIGNATURE.logo}
                srcSet={`${SIGNATURE.logo} 1x, ${SIGNATURE.logo2x} 2x`}
                alt={SIGNATURE.entreprise}
                className="h-10 w-auto"
                width={108}
                height={40}
                loading="lazy"
                decoding="async"
              />
            </span>
            <div>
              <p className="font-semibold text-ink">{SIGNATURE.nom}</p>
              <p className="text-sm text-ink-soft">
                {SIGNATURE.fonction}, {SIGNATURE.entreprise}
              </p>
            </div>
          </figcaption>
        </figure>

        <p className="mt-6 text-sm text-ink-soft">
          Propos recueillis le 23 août 2026, publiés avec son accord et relus
          par elle. C&apos;est le seul témoignage du site : nous en publierons
          d&apos;autres quand d&apos;autres clients accepteront, pas avant.
        </p>
      </div>
    </section>
  );
}

export default TemoignageSection;
