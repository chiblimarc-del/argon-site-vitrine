import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlanningBoard } from "@/components/product-ui/PlanningBoard";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { EquipesSection } from "@/components/sections/depth/EquipesSection";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * PAGE SOLUTION — PLANNING DES INTERVENTIONS.
 *
 * Reprend strictement le modèle posé par gestion-interventions :
 * SolutionHero → corps propre → SolutionFaq → RelatedPages → SolutionCta.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PÉRIMÈTRE SEO — principal : « logiciel planning interventions »
 * Secondaires : planning techniciens · logiciel planning techniciens ·
 * planification interventions · planning équipes terrain.
 *
 * ⚠️ Ne pas employer « logiciel de gestion des interventions » (page voisine)
 * ni « logiciel gestion interventions terrain » (accueil).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ANGLE ÉDITORIAL (cahier V2 §10) : le planning est un OUTIL DE DÉCISION, pas
 * un calendrier. Un calendrier enregistre ce qui est prévu ; un planning
 * d'exploitation sert à arbitrer quand le programme change — et il change tous
 * les jours. Toute la page tient sur cette distinction.
 *
 * RÈGLE DE VÉRITÉ (V2 §31) — validé : affectation à un intervenant et à un
 * créneau, visualisation de la charge des équipes, modification d'affectation,
 * interventions en attente d'affectation, planning consultable sur mobile.
 * INTERDIT : optimisation automatique de tournées, suggestion du « technicien
 * le plus proche », calcul d'itinéraire, IA de planification, géolocalisation
 * avancée. Argon montre ce qui est planifié ; il ne planifie pas à votre place.
 */

const PATH = "/solutions/planning-interventions";

export const metadata = metadataFor(PATH);

/* ==========================================================================
   CONTENU
   ========================================================================== */

/**
 * Les arbitrages réels d'une journée d'exploitation. C'est ce qui distingue un
 * planning d'un calendrier : chaque ligne est une décision, pas un
 * enregistrement.
 */
const arbitrages = [
  {
    situation: "Une urgence tombe à 10 h.",
    decision:
      "Vous regardez qui a de la marge dans l'après-midi, et ce qui peut être décalé sans prévenir trois clients.",
  },
  {
    situation: "Un technicien est absent.",
    decision:
      "Ses interventions de la journée sont visibles d'un bloc. Vous les réaffectez ou les reportez, sans en oublier une.",
  },
  {
    situation: "Une intervention déborde.",
    decision:
      "Le créneau suivant du même intervenant devient intenable. Vous le voyez avant que le client n'appelle.",
  },
  {
    situation: "Une demande arrive sans date.",
    decision:
      "Elle reste dans la file « à affecter » tant que personne ne l'a prise. Elle ne disparaît pas dans une boîte mail.",
  },
];

/** Ce que le tableau donne à lire. Uniquement des capacités validées. */
const lectures = [
  {
    titre: "Qui travaille, et sur quoi",
    texte:
      "Chaque intervenant a sa ligne. Une journée se lit d'un seul regard, sans ouvrir quatre fiches.",
  },
  {
    titre: "La charge réelle",
    texte:
      "Les créneaux occupés et les trous apparaissent tels quels. C'est ce qui permet de dire oui ou non à une demande, tout de suite.",
  },
  {
    titre: "Ce qui n'est pas encore affecté",
    texte:
      "Les interventions en attente restent visibles dans une file dédiée, jusqu'à ce qu'un intervenant et un créneau leur soient donnés.",
  },
  {
    titre: "L'état d'avancement",
    texte:
      "Les statuts se lisent sur les blocs eux-mêmes : ce qui est terminé, en cours, planifié, ou en retard.",
  },
];

/** FAQ — questions du cahier V2 §22, réponses strictement dans le périmètre. */
const faq: QuestionFaq[] = [
  {
    question: "Comment organiser le planning des techniciens ?",
    answer:
      "Chaque intervention est affectée à un intervenant et positionnée sur un créneau. Le planning affiche une ligne par intervenant sur la journée, ce qui permet de répartir la charge en voyant simultanément qui est déjà occupé et à quel moment.",
  },
  {
    question: "Peut-on modifier une affectation en cours de journée ?",
    answer:
      "Oui, et c'est le cas d'usage principal. Un programme d'exploitation change en permanence : urgence, absence, intervention qui déborde. L'affectation d'une intervention peut être modifiée, et l'intervenant concerné voit la mise à jour sur son application mobile.",
  },
  {
    question: "Comment visualiser les interventions d'une journée ?",
    answer:
      "Le planning présente les intervenants en lignes et la journée en colonnes. Chaque intervention apparaît comme un bloc positionné sur son créneau, avec son statut. Les interventions reçues mais pas encore affectées restent regroupées dans une file séparée.",
  },
  {
    question: "Argon optimise-t-il automatiquement les tournées ?",
    answer:
      "Non. Argon vous donne la visibilité nécessaire pour arbitrer — qui est disponible, qui est déjà chargé, ce qui reste à placer — mais la décision d'affectation vous appartient. L'optimisation automatique ne fait pas partie des fonctions disponibles aujourd'hui.",
  },
  {
    question: "Le technicien voit-il son planning de son côté ?",
    answer:
      "Oui. Depuis l'application mobile, l'intervenant consulte les missions qui lui sont affectées avec leur créneau et les informations du site. Une réaffectation décidée au bureau lui parvient sans appel téléphonique.",
  },
];

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function PlanningInterventionsPage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="Planning des interventions"
        accentue="sans perdre la maîtrise du terrain"
        chapo="Un planning d'exploitation n'est pas un calendrier : c'est l'outil avec lequel vous arbitrez quand la journée ne se passe pas comme prévu. Argon vous montre qui est disponible, qui est déjà chargé et ce qui reste à placer."
      />

      {/* ---------- Un outil de décision ---------- */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Décider, pas enregistrer"
          title="Un planning sert à arbitrer, pas à consigner."
          description="Un calendrier note ce qui était prévu. Un planning d'exploitation sert à décider ce qui change — et dans une entreprise d'intervention, quelque chose change tous les jours."
          className="max-w-3xl"
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {arbitrages.map((arbitrage) => (
            <li key={arbitrage.situation} className="card p-6">
              <h3 className="text-[16px] font-semibold text-ink">
                {arbitrage.situation}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {arbitrage.decision}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Le tableau ---------- */}
      <Section
        tone="alt"
        containerWidth="wide"
        className="border-b border-line-soft"
      >
        <SectionHeading
          as="h2"
          eyebrow="Le planning des équipes"
          title="La journée entière sur une seule vue."
          description="Une ligne par intervenant, la journée en largeur, les interventions en attente juste en dessous."
          className="max-w-3xl"
        />

        <div className="mt-12">
          <PlanningBoard />
        </div>

        <dl className="mt-14 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {lectures.map((lecture) => (
            <div key={lecture.titre}>
              <dt className="text-[15px] font-semibold text-ink">
                {lecture.titre}
              </dt>
              <dd className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                {lecture.texte}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <EquipesSection />

      {/* ---------- Ce qu'Argon ne fait pas ---------- */}
      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            La décision reste la vôtre.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            Argon ne réorganise pas votre journée à votre place. Il n&apos;y a
            ni optimisation automatique, ni proposition d&apos;affectation
            calculée — et nous préférons le dire plutôt que de vous le faire
            découvrir en démonstration.{" "}
            <span className="font-medium text-ink">
              Ce que la plateforme apporte, c&apos;est la visibilité
            </span>{" "}
            : savoir en trois secondes qui peut prendre l&apos;urgence qui vient
            d&apos;arriver. Dans une exploitation, c&apos;est rarement
            l&apos;algorithme qui manque, c&apos;est l&apos;information au bon
            moment.
          </p>
        </div>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="Autour du planning"
        chapo="Ce que le planning reçoit en amont, et ce qu'il déclenche ensuite."
        paths={[
          "/solutions/gestion-interventions",
          "/solutions/devis-facturation",
          "/solutions/application-mobile-technicien",
          "/solutions/rapports-intervention",
          "/secteurs/depannage",
          "/secteurs/maintenance",
          "/secteurs/transport-courses",
        ]}
      />

      <SolutionCta
        titre="Voyez votre journée type dans le planning Argon."
        texte="Nous partons de votre organisation réelle : vos équipes, vos créneaux, vos urgences."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
