import { Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { BillingPanel } from "@/components/product-ui/BillingPanel";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { EncaissementSection } from "@/components/sections/depth/EncaissementSection";
import { DocumentsSection } from "@/components/sections/depth/DocumentsSection";
import { metadataFor, webPageSchema, breadcrumbSchema } from "@/lib/seo";

/**
 * PAGE SOLUTION — DEVIS & FACTURATION.
 *
 * Modèle verrouillé, repris sans modification :
 * SolutionHero → corps propre → SolutionFaq → RelatedPages → SolutionCta.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PÉRIMÈTRE SEO — principal : « logiciel devis facture intervention »
 * Secondaires : logiciel devis intervention · logiciel facturation
 * intervention · devis et facture · relance devis · fiche client intervention.
 *
 * ⚠️ Ne pas employer « logiciel de gestion des interventions » (page voisine),
 * « logiciel planning interventions » (page voisine), ni « logiciel gestion
 * interventions terrain » (accueil).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ⚠️⚠️ VIGILANCE RENFORCÉE — C'EST LA SEULE PAGE QUI PARLE D'ARGENT.
 *
 * Formulation imposée : « génération et envoi des factures ».
 *
 * VALIDÉ, donc présentable : fiche client · devis · relance d'un devis resté
 * sans réponse · intervention · contrôle avant facturation · génération et
 * envoi de la facture.
 *
 * INTERDIT ABSOLU — aucune de ces briques n'existe dans le produit :
 *   · comptabilité, écritures, export comptable, rapprochement bancaire
 *   · TVA, paiements, encaissement, échéances, statut « payée »
 *   · recouvrement ou relance de facture automatisés
 *   · « pilotage financier », « comptabilité automatisée »,
 *     « facturation intelligente » et toute formule qui laisse entendre
 *     davantage que ce que le produit fait réellement
 *
 * Argon n'est ni un ERP, ni un logiciel comptable, et la page le dit
 * explicitement plutôt que de laisser le doute s'installer.
 */

const PATH = "/solutions/devis-facturation";

export const metadata = metadataFor(PATH);

/* ==========================================================================
   CONTENU
   ========================================================================== */

/**
 * La boucle commerciale complète. Chaque étape reprend une donnée déjà saisie :
 * c'est le fond de la page.
 */
const boucle = [
  {
    etape: "01",
    titre: "Le devis part de la fiche client",
    texte:
      "Le client, son site, son contact sont déjà là. Le devis se construit dessus, puis est envoyé — et reste attaché au dossier plutôt qu'à une boîte mail.",
  },
  {
    etape: "02",
    titre: "Le devis sans réponse reste visible",
    texte:
      "Un devis en attente ne se perd pas dans une pile. Il apparaît comme tel sur la fiche du client, et vous décidez quand le relancer.",
  },
  {
    etape: "03",
    titre: "Le devis accepté devient une intervention",
    texte:
      "Ce qui a été vendu devient ce qui doit être fait. Pas de nouvelle saisie : l'intervention hérite du client, du site et de la prestation.",
  },
  {
    etape: "04",
    titre: "L'intervention réalisée est contrôlée",
    texte:
      "Avant de facturer, l'intervention passe par le contrôle. Une anomalie signalée sur le terrain suspend la suite du parcours.",
  },
  {
    etape: "05",
    titre: "La facture est générée puis envoyée",
    texte:
      "Elle est établie à partir de l'intervention réellement réalisée et contrôlée, puis envoyée au client. Elle reste rattachée au dossier.",
  },
];

/**
 * Frontière explicite entre le produit et le reste. Sur une page qui parle
 * d'argent, l'ambiguïté se paie deux fois : en démonstration, puis en confiance.
 */
const perimetre = {
  couvert: [
    "La fiche client, ses contacts et ses sites",
    "L'établissement et l'envoi des devis",
    "La visibilité sur les devis restés sans réponse",
    "Le passage du devis accepté à l'intervention",
    "Le contrôle de l'intervention avant facturation",
    "La génération et l'envoi des factures",
  ],
  nonCouvert: [
    "La comptabilité et les écritures comptables",
    "Le suivi des règlements et des échéances",
    "Le rapprochement bancaire",
    "Le recouvrement automatisé des impayés",
    "La déclaration de TVA",
  ],
};

/** FAQ — réponses calibrées au mot près sur le périmètre réel. */
const faq: QuestionFaq[] = [
  {
    question: "Peut-on établir un devis directement depuis la fiche client ?",
    answer:
      "Oui. Le client, ses contacts et ses sites d'intervention sont déjà enregistrés : le devis se construit à partir de ces informations, puis est envoyé au client. Il reste ensuite attaché au dossier, consultable avec le reste de l'historique.",
  },
  {
    question: "Que devient un devis une fois accepté ?",
    answer:
      "Il donne lieu à une intervention, qui reprend le client, le site et la prestation prévue. C'est le principe de la plateforme : ce qui a été vendu devient ce qui doit être planifié, sans nouvelle saisie.",
  },
  {
    question: "Comment la facture est-elle établie ?",
    answer:
      "Elle est générée à partir de l'intervention réellement réalisée, une fois celle-ci contrôlée, puis envoyée au client. Ce qui a été fait sur le terrain et ce qui est facturé proviennent donc du même enregistrement.",
  },
  {
    question: "Argon est-il un logiciel de comptabilité ?",
    answer:
      "Non, et ce n'est pas son objet. Argon génère et envoie les factures issues de vos interventions. Il ne tient pas votre comptabilité : ni écritures, ni déclaration de TVA, ni rapprochement bancaire, ni suivi des règlements. Ces travaux restent du ressort de votre outil comptable et de votre cabinet.",
  },
  {
    question: "Argon relance-t-il automatiquement les devis et les factures ?",
    answer:
      "Non. Un devis resté sans réponse est signalé comme tel sur la fiche du client, ce qui vous permet de le voir et de décider de le relancer. Il n'y a ni relance automatique, ni recouvrement automatisé : la décision de relancer un client vous appartient.",
  },
];

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function DevisFacturationPage() {
  return (
    <>
      <Breadcrumbs path={PATH} />

      <SolutionHero
        path={PATH}
        eyebrow="Devis & facturation"
        accentue="sans ressaisir une ligne"
        chapo="Le devis part de la fiche client, l'intervention en découle, la facture est établie à partir de ce qui a réellement été réalisé. Une même information traverse toute la boucle commerciale."
      />

      {/* ---------- La boucle ---------- */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="La boucle commerciale"
          title="Ce qui est vendu, ce qui est fait, ce qui est facturé : le même dossier."
          description="Entre le devis et la facture, la plupart des entreprises ressaisissent trois fois la même chose. C'est le moment où les écarts apparaissent — et où les interventions réalisées finissent par ne jamais être facturées."
          className="max-w-3xl"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start lg:gap-16">
          <ol className="relative">
            <span
              aria-hidden="true"
              className="absolute bottom-8 left-[15px] top-4 w-px bg-line"
            />

            {boucle.map((element) => (
              <li key={element.etape} className="relative pb-9 pl-12 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-[11px] font-medium tabular-nums text-ink-soft"
                >
                  {element.etape}
                </span>
                <h3 className="text-[17px] font-semibold text-ink">
                  {element.titre}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                  {element.texte}
                </p>
              </li>
            ))}
          </ol>

          <div className="min-w-0 lg:sticky lg:top-24">
            <BillingPanel />
          </div>
        </div>
      </Section>

      {/* ---------- Le périmètre, dit franchement ---------- */}
      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Ce que fait Argon, ce qu'il ne fait pas"
          title="Une facturation d'exploitation, pas une comptabilité."
          description="Sur ce sujet plus que sur tout autre, mieux vaut le savoir avant la démonstration. Voici la frontière exacte."
          className="max-w-3xl"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="card p-6 sm:p-7">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok" />
              Ce qu&apos;Argon couvre
            </h3>
            <ul className="mt-5 space-y-3">
              {perimetre.couvert.map((element) => (
                <li
                  key={element}
                  className="flex items-start gap-3 text-[14.5px] leading-snug text-ink-soft"
                >
                  <Coche />
                  {element}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 sm:p-7">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-ink-muted"
              />
              Ce qui reste à votre outil comptable
            </h3>
            <ul className="mt-5 space-y-3">
              {perimetre.nonCouvert.map((element) => (
                <li
                  key={element}
                  className="flex items-start gap-3 text-[14.5px] leading-snug text-ink-muted"
                >
                  <Tiret />
                  {element}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <EncaissementSection />

      <DocumentsSection />

      {/* ---------- La décision reste la vôtre ---------- */}
      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Relancer un devis est une décision, pas un automatisme.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            Un devis resté sans réponse depuis onze jours apparaît comme tel sur
            la fiche du client. Argon vous le montre —{" "}
            <span className="font-medium text-ink">
              il ne relance aucun devis à votre place
            </span>
            . C&apos;est volontaire : dans une activité où vous connaissez vos
            clients, le moment et le ton d&apos;une relance commerciale valent
            souvent plus que sa régularité. Ce qui manque rarement, c&apos;est
            l&apos;envie de relancer ; ce qui manque, c&apos;est de savoir
            lequel.
          </p>
          {/*
            Le raccord vers l'encaissement, un écran plus haut. Sans lui, la
            page affirmait « il ne relance personne » à un écran d'une section
            qui décrit une procédure de relance : deux phrases justes — l'une
            parle du devis, l'autre de l'impayé — que rien ne distinguait pour
            le lecteur.

            La phrase ne se contente pas de séparer les deux périmètres : elle
            nomme ce qu'ils ont en commun. Les séparer aurait suffi à lever
            l'ambiguïté, mais aurait laissé croire à deux philosophies selon la
            page. Le principe est le même des deux côtés — l'envoi est une
            décision —, seul l'outillage diffère.
          */}
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            Une facture impayée est un autre sujet : elle suit la procédure
            décrite plus haut, dont les étapes se déverrouillent aux délais que
            vous avez fixés. Le principe, lui, ne change pas —{" "}
            <span className="font-medium text-ink">
              l&apos;envoi reste votre décision
            </span>
            .
          </p>
        </div>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="Ce qui alimente la facture"
        chapo="La facture est le dernier maillon : elle dépend de ce qui s'est passé avant."
        paths={[
          "/solutions/gestion-interventions",
          "/solutions/planning-interventions",
          "/solutions/rapports-intervention",
          "/secteurs/maintenance",
          "/secteurs/installation",
          "/secteurs/transport-courses",
        ]}
      />

      <SolutionCta
        titre="Voyez la boucle complète sur un de vos dossiers."
        texte="Un devis, une intervention, une facture : nous reprenons un cas réel de votre activité."
      />

      <JsonLd data={webPageSchema(PATH)} />
      <JsonLd data={breadcrumbSchema(PATH)} />
    </>
  );
}

/* ==========================================================================
   PICTOGRAMMES
   ========================================================================== */

function Coche() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="mt-[3px] h-4 w-4 shrink-0 text-ok"
      fill="none"
    >
      <path
        d="m4.5 10.5 3.5 3.5 7.5-8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Tiret() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="mt-[3px] h-4 w-4 shrink-0 text-ink-muted"
      fill="none"
    >
      <path
        d="M5 10h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
