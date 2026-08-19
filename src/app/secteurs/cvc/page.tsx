import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlanningBoard } from "@/components/product-ui/PlanningBoard";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * PAGE MÉTIER — CVC (climatisation & chauffage).
 *
 * PÉRIMÈTRE SEO — principal : « logiciel gestion interventions CVC »
 * Secondaires : logiciel entreprise climatisation · logiciel technicien
 * climatisation · planning techniciens climatisation · gestion interventions
 * climatisation · logiciel chauffage climatisation.
 *
 * ⚠️ La tête ne contient PAS « maintenance » : « logiciel gestion maintenance
 * climatisation » cannibaliserait /secteurs/maintenance. Décision V3.
 * ⚠️ Ne pas employer les mots-clés des pages voisines.
 *
 * ANGLE — LA SAISONNALITÉ. Ce métier a deux régimes dans l'année : l'entretien
 * quand c'est calme, le dépannage quand tout tombe en panne en même temps.
 * C'est la seule des cinq pages construite sur un cycle annuel plutôt que sur
 * une journée.
 *
 * RÈGLE DE VÉRITÉ : validé uniquement — fiches client et site, historique,
 * planning et affectation, mobile, photos, signature, comptes rendus,
 * devis, facturation. INTERDIT : contrats d'entretien gérés comme tels,
 * échéanciers de visite périodique automatiques, gestion d'équipements ou de
 * fluides, attestations réglementaires (F-Gas), stocks, IA, géolocalisation.
 */

const PATH = "/secteurs/cvc";

export const metadata = metadataFor(PATH);

const saisons = [
  {
    periode: "La saison creuse",
    titre: "L'entretien",
    texte:
      "Les visites s'enchaînent sur des sites déjà connus. Le sujet, c'est de les répartir sans laisser de trou dans le planning, et de savoir ce qui a été fait au passage précédent.",
    ton: "text-cyan",
  },
  {
    periode: "La saison haute",
    titre: "Le dépannage",
    texte:
      "Tout tombe en panne la même semaine. Le sujet devient : qui peut partir maintenant, et qu'est-ce qu'on décale. Ce n'est plus le même métier, avec les mêmes équipes.",
    ton: "text-warn",
  },
];

const apports = [
  {
    titre: "Un seul outil pour les deux régimes",
    texte:
      "Une visite d'entretien et un dépannage sont deux interventions. Elles vivent au même endroit, sur les mêmes fiches client, dans le même planning — vous ne changez pas d'outil quand la saison change.",
  },
  {
    titre: "L'historique du site suit d'une saison à l'autre",
    texte:
      "Le dépannage de janvier peut consulter ce qui a été constaté à l'entretien de septembre. Sur des installations qu'on suit pendant des années, c'est ce qui fait gagner du temps sur place.",
  },
  {
    titre: "Le planning encaisse les pics",
    texte:
      "Quand la charge double, la question devient uniquement : qui est disponible et jusqu'à quand. Le planning affiche une ligne par technicien, ce qui reste lisible même en pleine saison.",
  },
  {
    titre: "Le devis suit le diagnostic",
    texte:
      "Un dépannage qui révèle un remplacement à prévoir donne lieu à un devis, établi depuis la même fiche client. Il reste visible s'il n'obtient pas de réponse.",
  },
];

const faq: QuestionFaq[] = [
  {
    question: "Argon convient-il à la fois pour l'entretien et le dépannage ?",
    answer:
      "Oui, c'est même le point : les deux sont des interventions, rattachées aux mêmes clients et aux mêmes sites, gérées dans le même planning. Vous ne changez pas d'outil quand vous passez de la saison d'entretien à la saison de dépannage.",
  },
  {
    question: "Peut-on retrouver l'historique d'une installation ?",
    answer:
      "Oui. Toutes les interventions réalisées sur un site restent rattachées à sa fiche, avec leurs comptes rendus et leurs photos. Un technicien qui intervient en urgence peut voir ce qui a été constaté lors des passages précédents.",
  },
  {
    question: "Argon gère-t-il les contrats d'entretien et les visites périodiques ?",
    answer:
      "Pas en tant que tels. Argon ne gère pas d'échéancier contractuel qui générerait automatiquement les visites à date. Chaque passage est créé comme une intervention et planifié depuis le planning. Si la gestion contractuelle est votre besoin central, il faut le savoir avant d'aller plus loin.",
  },
  {
    question: "Argon gère-t-il les équipements et les fluides frigorigènes ?",
    answer:
      "Non. Il n'y a ni fiche équipement, ni suivi de fluides, ni production d'attestations réglementaires. Argon organise les interventions, les équipes et la preuve de réalisation — pas le parc technique ni la conformité réglementaire.",
  },
];

export default function CvcPage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="CVC — climatisation & chauffage"
        accentue="vos interventions CVC"
        chapo="Deux saisons, deux métiers : l'entretien quand c'est calme, le dépannage quand tout tombe en panne la même semaine. Avec les mêmes équipes, les mêmes clients et les mêmes sites."
      />

      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Deux régimes dans l'année"
          title="Votre activité change deux fois par an. Pas votre outil."
          description="Peu de métiers connaissent un écart de charge aussi net entre la saison creuse et la saison haute — et c'est le même effectif qui absorbe les deux."
          className="max-w-3xl"
        />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {saisons.map((saison) => (
            <li key={saison.titre} className="card p-6 sm:p-7">
              <p
                className={`text-[11px] font-medium uppercase tracking-[0.12em] ${saison.ton}`}
              >
                {saison.periode}
              </p>
              <h3 className="mt-2.5 text-[19px] font-semibold text-ink">
                {saison.titre}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {saison.texte}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Ce qu'Argon apporte"
          title="Le même socle, quelle que soit la saison."
          className="max-w-3xl"
        />
        <div className="mt-12">
          <PlanningBoard />
        </div>
        <dl className="mt-14 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {apports.map((apport) => (
            <div key={apport.titre}>
              <dt className="text-[15px] font-semibold text-ink">{apport.titre}</dt>
              <dd className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                {apport.texte}
              </dd>
            </div>
          ))}
        </dl>

        {/*
          Lot 1 — profondeur, intégrée au fil de la section existante.
          Deux sujets, choisis parce qu'ils découlent de l'angle de cette
          page. Pas de nouveau titre, pas de composant : une page métier
          répond à « comment Argon m'aide dans MON métier », pas à
          « voici encore toutes les fonctions d'Argon ».
        */}
        <p className="mt-12 max-w-3xl border-l-2 border-line pl-5 text-[15px] leading-relaxed text-ink-soft">
          Deux saisons, deux régimes : l&apos;entretien quand c&apos;est calme, le dépannage quand tout tombe en panne en même temps. Vos équipes ne travaillent pas de la même façon selon la période, et Argon suit les heures et les absences dans la même planification que les interventions. Vous voyez arriver la charge avant qu&apos;elle arrive — c&apos;est-à-dire au moment où il est encore possible de décider.
        </p>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="Les briques utiles en CVC"
        chapo="Le planning pour la saison haute, l'historique pour l'entretien, le devis pour ce qui se révèle en cours de route."
        paths={[
          "/solutions/planning-interventions",
          "/solutions/gestion-interventions",
          "/solutions/devis-facturation",
          "/secteurs/maintenance",
          "/secteurs/depannage",
          "/secteurs/installation",
        ]}
      />

      <SolutionCta
        titre="Voyez Argon sur vos deux saisons."
        texte="Une semaine d'entretien et une semaine de pointe : nous montrons comment les deux se pilotent au même endroit."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
