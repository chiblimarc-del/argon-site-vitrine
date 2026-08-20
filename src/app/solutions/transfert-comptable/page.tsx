import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * PAGE SOLUTION — TRANSFERT COMPTABLE.
 *
 * Modèle verrouillé, repris sans modification :
 * SolutionHero → corps propre → SolutionFaq → RelatedPages → SolutionCta.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PÉRIMÈTRE SEO — principal : « transmettre ses factures à son expert-comptable »
 * Secondaires : transfert comptable · export comptable intervention · export
 * factures expert-comptable · récapitulatif TVA export · fichier clients
 * comptable.
 *
 * ⚠️ Ne pas employer « logiciel devis facture intervention » (page voisine
 * devis-facturation), ni les mots-clés des autres pages solution.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ⚠️⚠️ CETTE PAGE PARLE DE COMPTABILITÉ. C'est le terrain le plus glissant du
 * site : une approximation y est lue comme un engagement, et un dirigeant qui
 * découvre après coup qu'Argon ne fait pas ce qu'il croyait a perdu son mois.
 *
 * TOUT CE QUI SUIT A ÉTÉ VÉRIFIÉ DANS LE CODE DU SAAS le 19/08/2026, dans
 * `backend/src/modules/transfert-compta/` et `facturation.repository.ts`.
 * Rien n'est déduit.
 *
 * LES SIX EXPORTS, tels qu'ils existent réellement :
 *   · Ventes ......... CSV par période — numéro, date de facture, date
 *                      d'échéance, client, HT, TVA, TTC, statut
 *   · Règlements ..... CSV par période — date, n° de facture, client, montant,
 *                      moyen de paiement, référence
 *   · Récap TVA ...... CSV par période — base HT, TVA, TTC par taux, + total
 *   · Factures ....... ZIP par période — un PDF par facture NUMÉROTÉE
 *                      (les brouillons en sont exclus : pas de numéro)
 *   · Avoirs ......... CSV par période — numéro, date, client, facture liée,
 *                      motif, HT, TVA, TTC
 *   · Clients ........ CSV — SANS période, c'est l'annuaire complet :
 *                      raison sociale, contact, e-mail, téléphone, adresse,
 *                      SIRET, forme juridique, statut
 *
 * L'HORODATAGE : `transfereComptaLe` est posé sur la facture APRÈS que le
 * fichier a été produit, jamais avant. Le code le documente lui-même — une
 * extraction qui échouerait laisserait sinon des factures annoncées comme
 * reprises alors que rien n'est parti. Deux exports le posent : le CSV des
 * ventes et l'archive des factures.
 *
 * L'ACCÈS DU CABINET : `comptabilite` est un module de permission à part
 * entière, avec ses axes lecture et écriture (`TeamRolePermission`). Un rôle
 * peut donc n'ouvrir que celui-là, en lecture. Ce n'est pas un « espace
 * expert-comptable » dédié : c'est le système de rôles de l'application, et la
 * page ne doit pas laisser croire à autre chose.
 *
 * ⚠️ RETIRÉ DU PLAN INITIAL — « PARAMÉTRAGE AUX CODES COMPTABLES ».
 *
 * L'onglet Comptabilité de la fiche entreprise porte cinq réglages. QUATRE ne
 * sont lus par aucun code, ni le backend, ni les exports : le journal des
 * ventes, le type de TVA, le préfixe de code comptable client et le préfixe de
 * libellé de transfert. Leurs seules occurrences sont la déclaration Prisma et
 * le formulaire qui les enregistre.
 *
 * Le cinquième, `tvaIntracommunautaire`, est bien vivant : il est imprimé dans
 * les mentions légales de la facture PDF, aux côtés du SIRET et du RCS
 * (`pdf-generator.service.ts:1695`). C'est une mention obligatoire, il ne se
 * touche pas.
 *
 * L'argument aurait donc été une preuve fabriquée. Il est consigné au registre
 * de dette technique, et il ne s'écrira ici que le jour où le code le fera.
 *
 * INTERDIT SUR CETTE PAGE, comme dans DocumentsSection :
 *   · « FEC » — n'existe pas dans le produit
 *   · « API », « intégration », « synchronisation », « connecteur »
 *   · « automatiquement », « en temps réel »
 *   · tout nom de logiciel comptable
 *   · « écritures », « partie double », « rapprochement bancaire »
 *   · toute formulation laissant entendre qu'Argon PRODUIT une déclaration
 *     de TVA. Le récapitulatif est indicatif, et la page le dit.
 *
 * Server Component, aucune image, aucun JavaScript.
 */

const PATH = "/solutions/transfert-comptable";

export const metadata = metadataFor(PATH);

/* ==========================================================================
   CONTENU
   ========================================================================== */

type Export = {
  /** Nom métier, pas nom de fichier. */
  nom: string;
  /** Ce que le fichier contient réellement, colonne par colonne. */
  contenu: string;
  /** La portée : une période, ou l'ensemble. */
  portee: string;
};

/**
 * Les six extractions. L'ordre suit celui du travail comptable : ce qui a été
 * facturé, ce qui a été encaissé, ce que ça donne en TVA, les pièces, les
 * corrections, puis les tiers.
 */
const extractions: Export[] = [
  {
    nom: "Les ventes",
    contenu:
      "Chaque facture de la période avec son numéro, sa date, son échéance, son client, ses montants hors taxes, de TVA et toutes taxes comprises, et son statut.",
    portee: "Un mois",
  },
  {
    nom: "Les règlements",
    contenu:
      "Ce qui a été encaissé : la date, la facture concernée, le client, le montant, le moyen de paiement et la référence.",
    portee: "Un mois",
  },
  {
    nom: "Le récapitulatif de TVA",
    contenu:
      "La base hors taxes, la TVA et le total, ventilés par taux, avec la ligne de total. Un récapitulatif de lecture, pas une déclaration.",
    portee: "Un mois",
  },
  {
    nom: "Les factures en PDF",
    contenu:
      "Une archive contenant un document par facture numérotée — les mêmes que celles reçues par vos clients. Un brouillon n'a pas de numéro, donc pas de facture, donc pas de PDF.",
    portee: "Un mois",
  },
  {
    nom: "Les avoirs",
    contenu:
      "Numéro, date, client, facture d'origine, motif et montants. Une correction se transmet avec ce qu'elle corrige, sinon elle se discute.",
    portee: "Un mois",
  },
  {
    nom: "Le fichier clients",
    contenu:
      "Raison sociale, contact, e-mail, téléphone, adresse, SIRET, forme juridique et statut.",
    portee: "L'ensemble",
  },
];

/**
 * FAQ. Questions issues de ce qu'un dirigeant demande réellement avant de
 * confier sa facturation à un outil, réponses strictement alignées sur le
 * périmètre vérifié. C'est le contenu le plus opposable de la page.
 */
const faq: QuestionFaq[] = [
  {
    question: "Argon remplace-t-il mon logiciel de comptabilité ?",
    answer:
      "Non. Argon ne tient pas votre comptabilité. Il prépare, centralise et alimente les informations et documents nécessaires à leur exploitation. Votre cabinet garde ses outils et son métier ; ce qui disparaît, c'est le travail de rassemblement qui précédait chaque envoi.",
  },
  {
    question: "Sous quel format sont les documents transmis ?",
    answer:
      "Cinq extractions en CSV, ouvrables dans n'importe quel tableur ou reprises telles quelles par un cabinet, et une archive contenant les factures en PDF. Aucun format propriétaire : ce sont des fichiers que vous pouvez ouvrir et vérifier vous-même avant de les transmettre.",
  },
  {
    question: "Le récapitulatif de TVA vaut-il déclaration ?",
    answer:
      "Non, et c'est important. Il présente la base hors taxes, la TVA et le total par taux sur la période : de quoi comprendre et contrôler. La déclaration reste établie par votre cabinet, à partir de sa propre comptabilité.",
  },
  {
    question: "Comment savoir ce qui a déjà été transmis ?",
    answer:
      "Chaque facture reprise par un export porte la date à laquelle elle l'a été, et le journal des ventes l'affiche. Cette date n'est posée qu'une fois le fichier réellement produit : si une extraction échoue, rien n'est marqué comme parti. Vous ne transmettez pas deux fois la même chose, et vous ne cherchez pas ce que vous auriez oublié.",
  },
  {
    question: "Mon comptable peut-il venir chercher les documents lui-même ?",
    answer:
      "Oui. Les droits d'Argon se règlent par module : un rôle peut n'ouvrir que la partie comptable, en lecture seule. Le cabinet dispose alors de son propre accès, limité à ce qui le concerne — il ne voit ni vos interventions, ni vos plannings, ni vos équipes.",
  },
];

export default function TransfertComptablePage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="Transfert comptable"
        accentue="déjà prêt"
        chapo="La fin du mois n'est plus une chasse aux documents. Vous choisissez une période, et vous obtenez six extractions qui décrivent ce qui a été facturé, encaissé, corrigé — et par qui."
      />

      {/* ---------- Les six extractions ---------- */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Le dossier du mois"
          title="Six extractions, une période, un dossier."
          description="Aucune n'est une vue résumée : chacune contient les colonnes qu'un cabinet demande, dans un format qu'il sait lire."
          className="max-w-3xl"
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {extractions.map((extraction) => (
            <li key={extraction.nom} className="card flex flex-col p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[16px] font-semibold text-ink">
                  {extraction.nom}
                </h3>
                <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                  {extraction.portee}
                </span>
              </div>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {extraction.contenu}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- L'horodatage ---------- */}
      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Ce qui est parti"
          title="Une facture transmise porte la date à laquelle elle l'a été."
          description="C'est ce qui rend le mois suivant simple : vous ne vous demandez plus ce que votre comptable a déjà, ni ce que vous lui avez promis d'envoyer."
          className="max-w-3xl"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="text-[16px] font-semibold text-ink">
              La date est posée après coup, jamais avant
            </h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              Le marquage n&apos;intervient qu&apos;une fois le fichier
              réellement produit. Si une extraction échoue, aucune facture
              n&apos;est annoncée comme reprise. L&apos;ordre compte : une
              application qui marque d&apos;abord et extrait ensuite finit par
              vous faire chercher des documents qui ne sont jamais partis.
            </p>
          </div>

          <div>
            <h3 className="text-[16px] font-semibold text-ink">
              Le journal des ventes le montre
            </h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              La date de reprise s&apos;affiche là où vous travaillez déjà vos
              factures. Vous n&apos;ouvrez pas un écran de plus pour savoir où
              vous en êtes : la facture elle-même vous le dit.
            </p>
          </div>
        </div>

        {/*
          Le point d'attention honnête : deux exports posent la date, les
          quatre autres non. L'écrire évite qu'un dirigeant croie que le
          fichier clients ou le récapitulatif de TVA se « marquent » eux aussi.
        */}
        <p className="mt-12 max-w-3xl border-l-2 border-line pl-5 text-[14.5px] leading-relaxed text-ink-soft">
          Ce sont les <span className="font-medium text-ink">pièces</span> qui
          se datent — les ventes et les factures en PDF. Un récapitulatif de TVA
          ou un fichier clients se régénère quand on veut : ils décrivent un
          état, ils ne constatent pas un envoi.
        </p>
      </Section>

      {/* ---------- L'accès du cabinet ---------- */}
      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Votre comptable vient chercher. Vous n&apos;envoyez plus rien.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            Les droits se règlent par module : un rôle peut n&apos;ouvrir que la
            partie comptable, en lecture seule.{" "}
            <span className="font-medium text-ink">
              Le cabinet dispose alors de son propre accès, limité à ce qui le
              concerne
            </span>{" "}
            — il ne voit ni vos interventions, ni vos plannings, ni vos équipes,
            et il n&apos;a besoin de personne pour récupérer son dossier. Ce
            n&apos;est pas un espace à part construit pour lui : ce sont les
            rôles de l&apos;application, appliqués à quelqu&apos;un
            d&apos;extérieur.
          </p>
          <p className="mt-6 max-w-3xl border-l-2 border-line pl-5 text-[14.5px] leading-relaxed text-ink-soft">
            Argon ne tient pas votre comptabilité. Il prépare, centralise et
            alimente les informations et documents nécessaires à leur
            exploitation.
          </p>
        </div>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="D'où viennent ces documents"
        chapo="Le transfert comptable ne produit rien : il reprend ce que le reste de la chaîne a déjà établi."
        paths={[
          "/solutions/devis-facturation",
          "/solutions/gestion-interventions",
          "/solutions/rapports-intervention",
          "/secteurs/maintenance",
          "/secteurs/transport-courses",
          "/secteurs/installation",
        ]}
      />

      <SolutionCta
        titre="Montrez-nous ce que vous transmettez aujourd'hui."
        texte="Apportez le dossier envoyé à votre cabinet le mois dernier : nous montrons ce qu'Argon aurait produit, et ce qu'il n'aurait pas fallu préparer."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
