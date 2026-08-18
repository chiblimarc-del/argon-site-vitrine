import { Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { AppPreview } from "@/components/product-ui/AppPreview";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema, breadcrumbSchema } from "@/lib/seo";

/**
 * PAGE MÉTIER — TRANSPORT & COURSES.
 *
 * PÉRIMÈTRE SEO — principal : « logiciel gestion courses »
 * Secondaires : logiciel coursier · logiciel transport léger · gestion
 * tournées · planning tournées · suivi courses · gestion chauffeurs.
 *
 * ⚠️ NE PAS viser « TMS » ni « logiciel gestion transport » : cette SERP est
 * tenue par des TMS à périmètre complet (eCMR, affrètement, réglementation
 * sociale) qu'Argon ne couvre pas. Décision d'architecture V3.
 * ⚠️ Ne pas employer les mots-clés des pages voisines.
 *
 * ANGLE — L'ENCHAÎNEMENT ET LA PREUVE. Une journée est une suite de points ;
 * une course se prouve. C'est ce qui distingue ce métier des quatre autres.
 *
 * RÈGLE DE VÉRITÉ : validé uniquement — courses créées et suivies,
 * affectation à un conducteur et à un créneau, planning, application mobile,
 * photos, signature à la livraison, comptes rendus, facturation.
 * INTERDIT ABSOLU : optimisation automatique de tournées, calcul
 * d'itinéraire, géolocalisation avancée, suivi GPS temps réel, eCMR,
 * affrètement, réglementation sociale, gestion de flotte, IA, comptabilité.
 * Argon n'est pas un TMS et la page le dit.
 */

const PATH = "/secteurs/transport-courses";

export const metadata = metadataFor(PATH);

const journee = [
  {
    titre: "Des donneurs d'ordre multiples",
    texte:
      "Chaque course a son client, son point de départ, son point d'arrivée et sa contrainte horaire. Mélanger deux donneurs d'ordre sur une même feuille, c'est perdre la traçabilité.",
  },
  {
    titre: "Un programme qui bouge toute la journée",
    texte:
      "Une course urgente s'ajoute, une autre est annulée. Le conducteur doit savoir ce qui a changé sans que vous ayez à l'appeler.",
  },
  {
    titre: "Une preuve à ramener",
    texte:
      "Sans élément de preuve à la livraison, une contestation se règle de mémoire. Et la mémoire d'un lundi ne vaut plus grand-chose le vendredi.",
  },
];

const apports = [
  {
    titre: "Chaque course porte son dossier",
    texte:
      "Donneur d'ordre, points, créneau, conducteur affecté. La course existe comme un enregistrement, pas comme une ligne sur un carnet.",
  },
  {
    titre: "Le conducteur reçoit et rend compte",
    texte:
      "Il consulte ses courses sur son mobile, avec les informations du client. Photos et signature à la livraison repartent dans le même dossier.",
  },
  {
    titre: "L'enchaînement se lit sur le planning",
    texte:
      "Une ligne par conducteur, la journée en largeur. Ce qui n'est pas encore attribué reste dans la file à affecter.",
  },
  {
    titre: "Ce qui est livré peut être facturé",
    texte:
      "La course réalisée et contrôlée alimente la facture. Une course faite qui n'arrive jamais sur une facture, c'est la perte la plus silencieuse du métier.",
  },
];

const faq: QuestionFaq[] = [
  {
    question: "Argon est-il un TMS ?",
    answer:
      "Non. Un TMS couvre l'affrètement, l'eCMR, la réglementation sociale et souvent la gestion de flotte. Argon est un outil de pilotage opérationnel des courses : qui fait quoi, quand, avec quelle preuve de réalisation, et ce qui part en facturation. Si votre besoin porte sur le transport routier lourd et ses obligations réglementaires, ce n'est pas le bon outil.",
  },
  {
    question: "Argon optimise-t-il les tournées automatiquement ?",
    answer:
      "Non. Il n'y a ni calcul d'itinéraire, ni optimisation automatique, ni suggestion du conducteur le plus proche. Argon vous montre les courses à placer et la charge de chaque conducteur ; la construction de la journée reste votre décision.",
  },
  {
    question: "Comment prouver qu'une course a bien été livrée ?",
    answer:
      "Le conducteur prend une photo et fait signer à la livraison depuis son application mobile. Ces éléments sont rattachés à la course et repris dans le compte rendu transmis au donneur d'ordre.",
  },
  {
    question: "Peut-on gérer plusieurs donneurs d'ordre en parallèle ?",
    answer:
      "Oui. Chaque course est rattachée à son client, avec ses points et son créneau. Le planning affiche l'ensemble des courses de la journée par conducteur, quel que soit le donneur d'ordre.",
  },
  {
    question: "Argon suit-il les véhicules en temps réel ?",
    answer:
      "Non. Il n'y a pas de suivi GPS des véhicules ni de géolocalisation avancée. Ce que vous suivez, ce sont les statuts des courses : affectée, démarrée, livrée.",
  },
];

export default function TransportCoursesPage() {
  return (
    <>
      <Breadcrumbs path={PATH} />

      <SolutionHero
        path={PATH}
        eyebrow="Transport & courses"
        accentue="depuis une seule plateforme"
        chapo="Une journée de courses, c'est une suite de points à enchaîner pour des donneurs d'ordre différents. Argon garde chaque course avec son client, son conducteur, son créneau et sa preuve de livraison."
      />

      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Le quotidien du métier"
          title="Ce qui se perd dans une journée de courses."
          description="Trois réalités qui n'ont rien d'exceptionnel — et qui coûtent surtout quand elles s'additionnent sur un mois."
          className="max-w-3xl"
        />
        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {journee.map((element) => (
            <li key={element.titre} className="card p-6">
              <h3 className="text-[16px] font-semibold text-ink">{element.titre}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {element.texte}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Ce qu'Argon apporte"
          title="Une course, ça se pilote et ça se prouve."
          className="max-w-3xl"
        />
        <div className="mt-12">
          <AppPreview />
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
          Chez un donneur d&apos;ordre, une facture sans numéro de bon de commande revient — et repart pour trente jours. Argon porte ce numéro sur les courses concernées, sur toute une période s&apos;il le faut, et pas course par course. Et quand la facture est partie, elle ne disparaît pas de votre vue : ce qui reste dû se relance selon une procédure, jusqu&apos;à la mise en demeure si nécessaire.
        </p>
      </Section>

      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Argon n&apos;est pas un TMS, et ne cherche pas à en être un.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            Pas d&apos;affrètement, pas d&apos;eCMR, pas de gestion
            réglementaire, pas de suivi GPS des véhicules.{" "}
            <span className="font-medium text-ink">
              Ce qu&apos;Argon couvre, c&apos;est l&apos;exploitation
            </span>{" "}
            : les courses, les conducteurs, les créneaux, la preuve de livraison
            et ce qui part en facturation. Pour du transport léger et de la
            course urgente, c&apos;est là que se joue la journée. Pour du
            transport lourd avec ses obligations propres, il vous faudra un TMS
            — autant le savoir maintenant.
          </p>
        </div>

      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="Les briques utiles au transport"
        chapo="L'organisation de la journée, la preuve de livraison, la facturation."
        paths={[
          "/solutions/planning-interventions",
          "/solutions/gestion-interventions",
          "/solutions/devis-facturation",
          "/secteurs/depannage",
          "/secteurs/maintenance",
          "/secteurs/installation",
        ]}
      />

      <SolutionCta
        titre="Reprenons une de vos journées de courses."
        texte="Vos donneurs d'ordre, vos conducteurs, vos créneaux : nous montrons comment la journée se pilote."
      />

      <JsonLd data={webPageSchema(PATH)} />
      <JsonLd data={breadcrumbSchema(PATH)} />
    </>
  );
}
