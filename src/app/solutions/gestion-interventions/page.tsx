import { Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { InterventionPanel } from "@/components/product-ui/InterventionPanel";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { EngagementsSection } from "@/components/sections/depth/EngagementsSection";
import { TableauDeBordSection } from "@/components/sections/depth/TableauDeBordSection";
import { metadataFor, webPageSchema, breadcrumbSchema } from "@/lib/seo";

/**
 * PAGE SOLUTION — GESTION DES INTERVENTIONS.
 *
 * C'est le MODÈLE des pages solution : les cinq suivantes reprennent la même
 * ossature (hero, corps propre à la page, FAQ, maillage, CTA) avec un contenu
 * réellement différent.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PÉRIMÈTRE SEO — mot-clé principal : « logiciel de gestion des interventions »
 *
 * ⚠️ « logiciel gestion interventions terrain » est INTERDIT sur cette page :
 * c'est le mot-clé principal de l'accueil. C'était la dernière cannibalisation
 * du site, elle est levée au registre — ne pas la réintroduire dans la
 * rédaction. Le mot « terrain » reste employé comme mot de la langue, jamais
 * dans cette expression exacte.
 *
 * Secondaires à couvrir naturellement : gestion intervention · suivi
 * interventions · logiciel suivi interventions · gestion missions terrain ·
 * cycle de vie intervention.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * RÈGLE DE VÉRITÉ (V2 §31) — présenté ici, car validé produit : demande,
 * affectation, planning, application mobile, photos, signature client, compte
 * rendu PDF, fenêtre Anomalies, SAS de Contrôle, historique client et site.
 * INTERDIT : IA, géolocalisation avancée, optimisation de tournées, stocks,
 * RH, BI, comptabilité. Ni ERP, ni logiciel comptable. Aucune offre
 * commerciale, aucun délai promis, aucun chiffre de performance.
 */

const PATH = "/solutions/gestion-interventions";

export const metadata = metadataFor(PATH);

/* ==========================================================================
   CONTENU
   ========================================================================== */

/** Le cycle de vie d'une intervention, de la demande à la clôture. */
const cycle = [
  {
    etape: "01",
    titre: "La demande",
    texte:
      "Un appel, un e-mail, un devis accepté : la demande devient une intervention rattachée à son client et à son site. Rien ne reste dans une boîte de réception.",
  },
  {
    etape: "02",
    titre: "L'affectation",
    texte:
      "Vous choisissez l'intervenant et le créneau. L'intervention quitte la liste des demandes pour entrer dans le planning de quelqu'un.",
  },
  {
    etape: "03",
    titre: "L'exécution",
    texte:
      "Le technicien reçoit sa mission sur son mobile, avec les informations du site. Il prend ses photos et fait signer le client sur place.",
  },
  {
    etape: "04",
    titre: "Le compte rendu",
    texte:
      "À la clôture, le compte rendu est généré en PDF avec les photos et la signature, puis transmis au client automatiquement.",
  },
  {
    etape: "05",
    titre: "Le contrôle",
    texte:
      "L'intervention est vérifiée avant d'entrer en facturation. Une anomalie signalée sur le terrain suspend la facturation, le temps que l'exploitation tranche.",
  },
];

/** Ce que porte une fiche d'intervention. Uniquement des éléments validés. */
const contenuFiche = [
  { cle: "Client et site", valeur: "Le donneur d'ordre et le lieu exact de l'opération." },
  { cle: "Intervenant", valeur: "Qui est affecté, et sur quel créneau." },
  { cle: "Statut", valeur: "Affectée, acceptée, démarrée, terminée." },
  { cle: "Photos", valeur: "Ce qui a été constaté et réalisé sur place." },
  { cle: "Signature", valeur: "La validation du client, prise sur le mobile." },
  { cle: "Compte rendu", valeur: "Le PDF généré à la clôture, transmis au client." },
  { cle: "Historique", valeur: "Tous les passages précédents sur le même site." },
  { cle: "Anomalies", valeur: "Ce que le technicien a signalé et qui bloque la clôture." },
];

/**
 * FAQ. Questions issues du cahier V2 §22, réponses strictement alignées sur le
 * périmètre produit validé — c'est le contenu le plus lu et le plus opposable.
 */
const faq: QuestionFaq[] = [
  {
    question: "Comment fonctionne la gestion des interventions dans Argon ?",
    answer:
      "Chaque intervention suit le même cycle : elle est créée à partir d'une demande ou d'un devis accepté, affectée à un intervenant et à un créneau, exécutée sur le terrain depuis l'application mobile, puis clôturée par un compte rendu. Tout reste rattaché à la fiche du client et du site concerné.",
  },
  {
    question: "Peut-on planifier une intervention et changer l'affectation ?",
    answer:
      "Oui. Une intervention est affectée à un intervenant et positionnée sur un créneau depuis le planning. L'affectation peut être modifiée : c'est le quotidien d'une exploitation, où le programme de la journée change en permanence.",
  },
  {
    question: "Comment suivre l'état d'une intervention en cours ?",
    answer:
      "Chaque intervention porte un statut qui évolue au fil de son exécution : affectée, acceptée, démarrée, terminée. Le suivi se lit depuis la liste des interventions du jour, sans avoir à appeler l'intervenant pour savoir où il en est.",
  },
  {
    question: "Le technicien peut-il faire son compte rendu depuis le terrain ?",
    answer:
      "Oui. Depuis l'application mobile, il consulte les informations de la mission, prend des photos, signale une anomalie si nécessaire et fait signer le client. Le compte rendu est ensuite généré en PDF, sans ressaisie au bureau.",
  },
  {
    question: "Que se passe-t-il si quelque chose s'est mal passé sur place ?",
    answer:
      "Si le technicien signale une anomalie — pièce manquante, accès impossible, prestation modifiée —, elle remonte à l'exploitation, qui décide s'il y a un supplément à facturer et le dit au client. La course reprend son cours une fois la décision prise, et le supplément est justifié à la date où il s'est produit.",
  },
];

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function GestionInterventionsPage() {
  return (
    <>
      <Breadcrumbs path={PATH} />

      <SolutionHero
        path={PATH}
        eyebrow="Gestion des interventions"
        accentue="de la demande au compte rendu"
        chapo="Chaque intervention porte son client, son intervenant, son créneau et sa preuve de réalisation. De la demande initiale à la clôture, l'information est saisie une fois et suit l'opération jusqu'au bout."
      />

      {/* ---------- Le cycle de vie ---------- */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Le cycle de vie d'une intervention"
          title="Cinq étapes, une seule saisie."
          description="C'est le même enregistrement qui traverse toute l'opération. Personne ne recopie une information d'un outil vers un autre."
          className="max-w-3xl"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
          <ol className="relative">
            {/* Filet continu reliant les étapes. */}
            <span
              aria-hidden="true"
              className="absolute bottom-8 left-[15px] top-4 w-px bg-line"
            />

            {cycle.map((element) => (
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
            <InterventionPanel />
          </div>
        </div>
      </Section>

      {/* ---------- Ce que porte une fiche ---------- */}
      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="La fiche d'intervention"
          title="Tout ce qui s'est passé reste au même endroit."
          description="Six mois plus tard, retrouver ce qui a été fait sur un site ne demande ni de fouiller une boîte mail, ni de rappeler le technicien."
          className="max-w-3xl"
        />

        <dl className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {contenuFiche.map((element) => (
            <div key={element.cle}>
              <dt className="text-[14px] font-semibold text-ink">{element.cle}</dt>
              <dd className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                {element.valeur}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <EngagementsSection />

      <TableauDeBordSection />

      {/* ---------- Le contrôle avant facturation ---------- */}
      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Une intervention terminée n&apos;est pas forcément une intervention
            conforme.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            C&apos;est la différence entre suivre des interventions et les
            piloter. Quand le technicien signale une anomalie,{" "}
            <span className="font-medium text-ink">
              la course n&apos;avance plus tant que l&apos;exploitation
              n&apos;a pas décidé
            </span>{" "}
            s&apos;il y a un supplément à facturer. Le client est informé, et
            rien ne progresse vers la facture avant cette décision. Ce point de
            contrôle évite deux choses également coûteuses — facturer un
            supplément que personne n&apos;a arbitré, et devoir le justifier
            trois semaines plus tard sans rien pour le prouver.
          </p>
        </div>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="La suite du parcours"
        chapo="La gestion des interventions s'appuie sur ces briques, et alimente les suivantes."
        paths={[
          "/solutions/planning-interventions",
          "/solutions/devis-facturation",
          "/solutions/application-mobile-technicien",
          "/solutions/rapports-intervention",
          "/secteurs/maintenance",
          "/secteurs/depannage",
          "/secteurs/installation",
        ]}
      />

      <SolutionCta
        titre="Voyez le cycle complet sur vos propres interventions."
        texte="Nous reprenons vos types de missions et votre organisation pour montrer comment Argon les enchaîne."
      />

      <JsonLd data={webPageSchema(PATH)} />
      <JsonLd data={breadcrumbSchema(PATH)} />
    </>
  );
}
