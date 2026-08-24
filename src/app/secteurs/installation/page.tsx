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
 * PAGE MÉTIER — INSTALLATION.
 *
 * PÉRIMÈTRE SEO — principal : « logiciel gestion installation »
 * Secondaires : logiciel gestion installations · planning installation ·
 * suivi installation · intervention installation · techniciens installation.
 *
 * ⚠️ Ne pas employer les mots-clés des pages voisines.
 *
 * ANGLE — LES PHASES ET LA PREUVE. Une installation ne se juge pas à la pose
 * mais à la réception : c'est le moment où le client valide, et c'est là que se
 * décide s'il y aura une contestation. La page est construite autour de la
 * preuve de réalisation.
 *
 * RÈGLE DE VÉRITÉ : validé uniquement — devis, planning et affectation,
 * mobile, photos, signature client, comptes rendus, contrôle avant
 * facturation, facturation. INTERDIT : gestion de chantier au sens BTP
 * (lots, sous-traitance, avancement budgétaire), stocks, matériel, IA,
 * géolocalisation avancée, comptabilité.
 */

const PATH = "/secteurs/installation";

export const metadata = metadataFor(PATH);

const phases = [
  {
    numero: "01",
    titre: "Préparer",
    texte:
      "Le devis accepté devient l'intervention. Le site, le contact et la prestation prévue sont déjà renseignés : l'équipe part avec ce qui a été vendu, pas avec une version approximative.",
  },
  {
    numero: "02",
    titre: "Poser",
    texte:
      "L'intervenant a sa mission et les informations du site sur son mobile. Il documente ce qu'il installe au fur et à mesure, avec des photos.",
  },
  {
    numero: "03",
    titre: "Réceptionner",
    texte:
      "Le client signe sur place. Photos et signature partent avec le compte rendu : la mise en service est constatée, pas affirmée.",
  },
];

const preuve = [
  {
    titre: "Les photos font foi",
    texte:
      "Ce qui a été posé, dans quel état était le site avant, comment il a été laissé après. Six mois plus tard, ces images valent mieux que le souvenir de tout le monde.",
  },
  {
    titre: "La signature du client clôt la discussion",
    texte:
      "Prise sur le mobile au moment de la réception, elle est attachée au compte rendu. Elle n'est pas rangée dans une pochette au fond d'un camion.",
  },
  {
    titre: "Le contrôle protège la facture",
    texte:
      "Si l'intervenant a signalé une réserve, l'intervention n'entre pas en facturation tant que vous n'avez pas décidé ce qui sera facturé. Le client est informé de la réserve le jour même : trois mois plus tard, la trace existe.",
  },
];

const faq: QuestionFaq[] = [
  {
    question: "Comment suivre une installation du devis à la réception ?",
    answer:
      "Le devis accepté donne lieu à une intervention, qui reprend le client, le site et la prestation. L'intervention est planifiée, réalisée avec photos et signature, puis clôturée par un compte rendu. Le devis, l'intervention et la facture restent sur la même fiche client.",
  },
  {
    question: "Comment conserver la preuve de la mise en service ?",
    answer:
      "Les photos prises sur place et la signature du client sont rattachées à l'intervention, et reprises dans le compte rendu PDF transmis au client. Elles restent consultables depuis la fiche du site, sans limite de temps.",
  },
  {
    question: "Que se passe-t-il si le client émet une réserve à la réception ?",
    answer:
      "L'intervenant signale la réserve depuis son mobile. Elle remonte à l'exploitation, qui tranche ce qui sera facturé, et le client en est informé. La facturation attend cette décision.",
  },
  {
    question: "Argon gère-t-il le matériel et l'approvisionnement du chantier ?",
    answer:
      "Non. Argon ne gère ni stocks, ni pièces, ni approvisionnement. Il organise les interventions, les équipes et la preuve de réalisation. Si votre besoin porte principalement sur la gestion de matériel, il faudra le traiter avec un autre outil.",
  },
];

export default function InstallationPage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="Installation"
        accentue="du planning à la réalisation"
        chapo="Une installation ne se juge pas au moment de la pose, mais à celui de la réception. C'est là que le client valide — ou pas. Argon fait en sorte que ce moment soit documenté."
      />

      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Trois phases, un seul dossier"
          title="Préparer, poser, réceptionner."
          description="Chaque phase reprend ce que la précédente a produit. Le devis nourrit l'intervention, l'intervention nourrit le compte rendu."
          className="max-w-3xl"
        />
        <ol className="mt-14 grid gap-5 lg:grid-cols-3">
          {phases.map((phase) => (
            <li key={phase.numero} className="card p-6">
              <span className="font-mono text-[12px] text-accent-text">
                {phase.numero}
              </span>
              <h3 className="mt-3 text-[17px] font-semibold text-ink">
                {phase.titre}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
                {phase.texte}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="La preuve de réalisation"
          title="Ce qui a été fait doit pouvoir se montrer."
          description="Sur une installation, la contestation arrive rarement le jour même. Elle arrive trois mois plus tard, et il faut alors des éléments."
          className="max-w-3xl"
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <dl className="space-y-8">
            {preuve.map((element) => (
              <div key={element.titre}>
                <dt className="text-[16px] font-semibold text-ink">{element.titre}</dt>
                <dd className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                  {element.texte}
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
          Un chantier se pilote par phases, et chaque phase engage de l&apos;argent avant d&apos;en rapporter. Argon garde l&apos;engagement rattaché au chantier : à la réception, vous savez ce qui a été commandé, à quel tarif, pour quelle phase. La preuve de réalisation suit le même dossier — ce qui a été posé se montre sans aller chercher ailleurs.
        </p>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="Les briques utiles à l'installation"
        chapo="Du devis signé à la facture, en passant par la preuve de réception."
        paths={cheminsDe(PATH)}
        motifs={motifsDe(PATH)}
      />

      <SolutionCta
        titre="Prenez un chantier récent, nous le rejouons."
        texte="Du devis à la réception signée : nous montrons ce que le dossier aurait contenu."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
