import { BlocProfondeur, type TroisPreuves } from "./BlocProfondeur";

/**
 * BLOC 2 — LES DOCUMENTS.
 * /solutions/devis-facturation, immédiatement après l'encaissement.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FORMULE COMPTABLE VERROUILLÉE — UNIQUE SUR TOUT LE SITE
 *
 *   « Argon ne tient pas votre comptabilité. Il prépare, centralise et
 *     alimente les informations et documents nécessaires à leur
 *     exploitation. »
 *
 * Mot pour mot, aucune variante, où que la frontière comptable apparaisse.
 * Une frontière reformulée à chaque page cesse d'être une frontière.
 *
 * INTERDIT dans ce bloc : « FEC » (n'existe pas dans le produit) · « API »,
 * « intégration », « synchronisation », « connecteur » (interne) ·
 * « automatiquement », « en temps réel » · tout nom de logiciel comptable ·
 * « écritures », « partie double », « déclaration de TVA », « rapprochement
 * bancaire ».
 *
 * La facture directe et les avoirs sont nommés par leur BÉNÉFICE à
 * l'intérieur d'une ligne existante — jamais en quatrième ligne. La règle de
 * trois n'a pas d'exception.
 * ─────────────────────────────────────────────────────────────────────────
 */

const preuves: TroisPreuves = [
  {
    titre: "Par période, pas pièce par pièce",
    texte:
      "Vous choisissez un mois, vous obtenez ce qui le concerne. Les factures de votre activité, celles que vous émettez en direct pour tout le reste, et les avoirs : même dossier, même période.",
  },
  {
    titre: "Argon sait ce qui est déjà parti",
    texte:
      "Chaque document repris par la comptabilité est daté, et le journal des ventes le montre. Vous ne transmettez pas deux fois, et vous ne cherchez pas ce que vous auriez oublié.",
  },
  {
    titre: "Votre comptable vient chercher",
    texte:
      "Il dispose de son propre accès, limité à ce qui le concerne. Vous n'envoyez plus rien.",
  },
];

export function DocumentsSection() {
  return (
    <BlocProfondeur
      tone="alt"
      eyebrow="Après la facture"
      titre="Vous ne rassemblez plus rien pour votre comptable."
      chapo="La fin du mois ne déclenche plus une chasse aux documents. Ce qui a été facturé est déjà rangé, daté, et prêt à être repris."
      preuves={preuves}
      frontiere={
        <>
          Argon ne tient pas votre comptabilité. Il prépare, centralise et
          alimente les informations et documents nécessaires à leur
          exploitation.
        </>
      }
      /*
       * Passerelle ouverte le 19/08/2026, jour où la page a été écrite.
       * Elle était volontairement absente jusque-là : un lien creux coûte plus
       * qu'un lien absent.
       *
       * Le bloc garde ses trois preuves et ne renvoie vers la page que pour le
       * détail — les six extractions, leur contenu colonne par colonne, et ce
       * que le cabinet voit de son côté. Un bloc de profondeur annonce, il
       * n'épuise pas.
       */
      passerelle={{
        href: "/solutions/transfert-comptable",
        libelle: "Le détail de ce qui part au cabinet",
      }}
    />
  );
}
