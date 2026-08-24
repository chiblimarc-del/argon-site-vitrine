import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { InterventionPanel } from "@/components/product-ui/InterventionPanel";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { cheminsDe, motifsDe } from "@/lib/maillage-metiers";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * PAGE MÉTIER — MAINTENANCE.
 *
 * PÉRIMÈTRE SEO — principal : « logiciel gestion maintenance »
 * Secondaires : logiciel maintenance · gestion interventions maintenance ·
 * logiciel maintenance techniciens · suivi maintenance · planning maintenance.
 *
 * ⚠️ NE PAS employer « GMAO » comme tête de requête. La SERP GMAO est verrouillée
 * par des listicles et un domaine exact-match ; s'y frotter est du gaspillage, et
 * Argon n'est pas une GMAO (ni gestion d'actifs, ni stocks, ni pièces).
 * ⚠️ Ne pas employer les mots-clés des pages voisines : « logiciel de gestion
 * des interventions », « logiciel planning interventions », « logiciel gestion
 * interventions terrain ».
 *
 * ANGLE — LA RÉCURRENCE. Ce métier revient sur les mêmes sites. Ce qui compte
 * n'est pas l'intervention du jour mais ce qui s'est passé la fois précédente.
 * Toute la page tient là-dessus.
 *
 * RÈGLE DE VÉRITÉ : validé uniquement — fiches client et site, historique des
 * passages, planning et affectation, application mobile, photos, signature,
 * comptes rendus. INTERDIT : contrats d'entretien, gestion d'équipements,
 * maintenance préventive planifiée automatiquement, stocks, pièces, IA,
 * géolocalisation avancée, comptabilité.
 */

const PATH = "/secteurs/maintenance";

export const metadata = metadataFor(PATH);

const quotidien = [
  {
    titre: "Les mêmes sites, encore et encore",
    texte:
      "Un technicien qui arrive sur un site qu'il ne connaît pas perd la première demi-heure. Celui qui a l'historique sous les yeux sait déjà ce qui a été changé la dernière fois.",
  },
  {
    titre: "Une équipe qui tourne",
    texte:
      "Ce n'est jamais le même intervenant qui repasse. La mémoire du site ne peut donc pas reposer sur la mémoire d'une personne.",
  },
  {
    titre: "Des comptes rendus qui s'accumulent",
    texte:
      "Un an de passages sur un site, c'est une pile de documents. Retrouver celui de mars ne devrait pas demander de fouiller une boîte mail.",
  },
];

const apports = [
  {
    titre: "L'historique est attaché au site",
    texte:
      "Chaque intervention reste rattachée à son client et à son site. Les passages précédents se consultent depuis la même fiche, avec leurs photos et leurs comptes rendus.",
  },
  {
    titre: "Le technicien part informé",
    texte:
      "Il reçoit sa mission sur son mobile avec les informations du site. Ce qu'il constate sur place — photos, anomalies — repart dans la même fiche.",
  },
  {
    titre: "La charge des équipes se lit",
    texte:
      "Le planning montre qui est déjà engagé et sur quels créneaux. Répartir les passages du mois se fait en voyant la charge réelle.",
  },
  {
    titre: "Le compte rendu part sans ressaisie",
    texte:
      "Généré en PDF à la clôture avec les photos et la signature du client, puis transmis. Le bureau ne recopie rien.",
  },
];

const faq: QuestionFaq[] = [
  {
    question: "Argon est-il une GMAO ?",
    answer:
      "Non. Une GMAO gère un parc d'équipements, des stocks de pièces et des plans de maintenance préventive. Argon gère les interventions : qui va où, quand, ce qui a été fait et ce qui a été facturé. Si votre besoin porte sur la gestion d'actifs industriels, ce n'est pas le bon outil ; s'il porte sur l'organisation de vos équipes de maintenance, c'est exactement son objet.",
  },
  {
    question: "Peut-on retrouver ce qui a été fait lors du passage précédent ?",
    answer:
      "Oui. Les interventions sont rattachées au site sur lequel elles ont eu lieu. Depuis la fiche du site, l'historique des passages est consultable avec les comptes rendus et les photos prises à chaque fois.",
  },
  {
    question: "Comment organiser les passages réguliers sur plusieurs sites ?",
    answer:
      "Chaque passage est créé comme une intervention, affectée à un technicien et positionnée sur un créneau depuis le planning. Argon ne génère pas automatiquement les échéances d'un plan de maintenance : la programmation des passages reste une décision d'exploitation.",
  },
  {
    question: "Le technicien peut-il signaler un problème constaté sur place ?",
    answer:
      "Oui. Il signale l'anomalie depuis l'application mobile — pièce manquante, accès impossible, prestation à revoir. Elle remonte à l'exploitation, qui décide s'il y a un supplément à facturer, et l'intervention n'avance pas vers la facture avant cette décision.",
  },
];

export default function MaintenancePage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="Maintenance"
        accentue="avec une vision claire du terrain"
        chapo="En maintenance, on revient. Sur les mêmes sites, avec des équipes qui tournent. Ce qui fait la différence, ce n'est pas l'intervention du jour : c'est de savoir ce qui s'est passé la fois d'avant."
      />

      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Le quotidien du métier"
          title="La mémoire du site vaut plus que la fiche du jour."
          description="Trois situations que connaît toute entreprise de maintenance, et qui n'ont rien à voir avec un problème de logiciel — jusqu'au jour où l'information manque."
          className="max-w-3xl"
        />
        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {quotidien.map((element) => (
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
          title="Tout ce qui a été fait reste attaché au site."
          className="max-w-3xl"
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <dl className="space-y-8">
            {apports.map((apport) => (
              <div key={apport.titre}>
                <dt className="text-[16px] font-semibold text-ink">{apport.titre}</dt>
                <dd className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                  {apport.texte}
                </dd>
              </div>
            ))}
          </dl>
          <div className="min-w-0 lg:sticky lg:top-24">
            <InterventionPanel />
          </div>
        </div>

        {/*
          Lot 1 — profondeur, intégrée au fil de la section existante.
          Deux sujets, choisis parce qu'ils découlent de l'angle de cette
          page. Pas de nouveau titre, pas de composant : une page métier
          répond à « comment Argon m'aide dans MON métier », pas à
          « voici encore toutes les fonctions d'Argon ».
        */}
        <p className="mt-12 max-w-3xl border-l-2 border-line pl-5 text-[15px] leading-relaxed text-ink-soft">
          Un contrat d&apos;entretien se juge sur l&apos;année, pas sur une visite. Argon garde le temps réellement passé sur chaque site, visite après visite : au renouvellement, vous discutez sur des heures constatées et non sur une impression. Ce qui a été engagé sur le contrat suit le même chemin — vous savez ce que ce site vous a coûté avant de le retarifer.
        </p>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="Les briques utiles à la maintenance"
        chapo="Ce que vous utiliserez au quotidien, et les autres métiers qui partagent le même socle."
        paths={cheminsDe(PATH)}
        motifs={motifsDe(PATH)}
      />

      <SolutionCta
        titre="Voyez Argon sur un de vos sites en contrat."
        texte="Nous partons d'un site que vous suivez déjà, avec son historique et ses passages."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
