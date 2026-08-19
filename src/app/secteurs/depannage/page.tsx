import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlanningBoard } from "@/components/product-ui/PlanningBoard";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * PAGE MÉTIER — DÉPANNAGE.
 *
 * PÉRIMÈTRE SEO — principal : « logiciel gestion dépannage »
 * Secondaires : logiciel dépannage · gestion interventions dépannage ·
 * planning dépannage · intervention urgente · techniciens dépannage.
 *
 * ⚠️ Ne pas employer les mots-clés des pages voisines.
 *
 * ANGLE — LA RÉACTION. Ici la valeur ne se joue pas sur l'intervention mais
 * sur les minutes qui précèdent : entre l'appel et le départ. La page est
 * construite comme un chronomètre, pas comme un catalogue.
 *
 * RÈGLE DE VÉRITÉ : validé uniquement — création rapide d'une intervention,
 * lecture des disponibilités, affectation et réaffectation, mobile, photos,
 * signature, comptes rendus, clôture. INTERDIT : suggestion du technicien le
 * plus proche, calcul d'itinéraire, géolocalisation avancée, IA, délai
 * d'intervention garanti, astreinte automatisée, statistiques de réactivité.
 */

const PATH = "/secteurs/depannage";

export const metadata = metadataFor(PATH);

/** Le temps réel d'un dépannage, côté exploitation. Aucun délai promis. */
const chronologie = [
  {
    moment: "L'appel",
    texte:
      "Un client est en panne. La demande est créée avec son site et ce qu'il décrit, pendant que vous l'avez encore au téléphone.",
  },
  {
    moment: "La question",
    texte:
      "Qui peut y aller, et quand ? C'est la seule question qui compte, et c'est celle qui prend le plus de temps quand l'information est dispersée.",
  },
  {
    moment: "L'affectation",
    texte:
      "Le planning montre qui est engagé et jusqu'à quand. L'intervention est affectée, l'intervenant la reçoit sur son mobile.",
  },
  {
    moment: "Le retour",
    texte:
      "Photos, compte rendu, signature du client. Le dossier est complet à la clôture, pas le lendemain matin.",
  },
];

const points = [
  {
    titre: "Rien ne se perd entre deux appels",
    texte:
      "Une demande enregistrée existe, même si personne n'a encore pu la prendre. Elle reste dans la file « à affecter » jusqu'à ce qu'un intervenant lui soit donné.",
  },
  {
    titre: "Réaffecter est la norme, pas l'exception",
    texte:
      "Un dépannage qui déborde décale tout le reste. L'affectation se modifie, et l'intervenant concerné voit la mise à jour sans qu'on l'appelle.",
  },
  {
    titre: "Le client sait ce qui a été fait",
    texte:
      "Le compte rendu part à la clôture avec les photos. Sur une intervention d'urgence, c'est souvent ce document qui évite la discussion sur la facture.",
  },
];

const faq: QuestionFaq[] = [
  {
    question: "Comment créer rapidement une intervention d'urgence ?",
    answer:
      "L'intervention est créée depuis la fiche du client, avec le site concerné et la description de la panne. Elle rejoint immédiatement la file des interventions à affecter, où elle reste visible tant qu'aucun intervenant ne lui a été donné.",
  },
  {
    question: "Comment savoir qui est disponible tout de suite ?",
    answer:
      "Le planning affiche une ligne par intervenant sur la journée : les créneaux occupés et les trous apparaissent tels quels. Vous voyez donc qui est engagé jusqu'à quelle heure. Argon ne désigne pas d'intervenant à votre place et ne calcule pas de proximité géographique — la décision reste la vôtre.",
  },
  {
    question: "Peut-on décaler une intervention déjà planifiée ?",
    answer:
      "Oui, et c'est le cas d'usage normal en dépannage. L'affectation d'une intervention se modifie à tout moment, et l'intervenant voit le changement sur son application mobile.",
  },
  {
    question: "Argon gère-t-il les astreintes et les délais garantis ?",
    answer:
      "Non. Argon ne gère pas de rotation d'astreinte automatisée et n'applique aucun engagement de délai contractuel. Il vous donne la visibilité pour arbitrer vite ; l'organisation de l'astreinte reste la vôtre.",
  },
];

export default function DepannagePage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="Dépannage"
        accentue="et gardez le contrôle de chaque intervention"
        chapo="En dépannage, tout se joue avant l'intervention : entre l'appel du client et le moment où quelqu'un part. Argon vous donne, à cet instant précis, ce qu'il faut pour décider."
      />

      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Les quinze premières minutes"
          title="Le vrai sujet, c'est le temps qui précède le départ."
          description="L'intervention elle-même, vos équipes savent la faire. Ce qui coûte, c'est ce qui se passe entre l'appel et l'affectation."
          className="max-w-3xl"
        />

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {chronologie.map((element, index) => (
            <li key={element.moment} className="card p-6">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-warn/40 bg-warn/10 text-[11px] font-medium tabular-nums text-warn"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-[16px] font-semibold text-ink">
                {element.moment}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                {element.texte}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Ce que ça change"
          title="Voir la charge, c'est pouvoir répondre au client tout de suite."
          className="max-w-3xl"
        />
        <div className="mt-12">
          <PlanningBoard />
        </div>
        <dl className="mt-14 grid gap-x-8 gap-y-8 lg:grid-cols-3">
          {points.map((point) => (
            <div key={point.titre}>
              <dt className="text-[15px] font-semibold text-ink">{point.titre}</dt>
              <dd className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                {point.texte}
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
          En dépannage, la question n&apos;est jamais « qu&apos;est-ce qui s&apos;est passé ce mois-ci », mais « qu&apos;est-ce qui coince maintenant ». Argon affiche ce qui attend et à quelle étape, en direct. Et parce qu&apos;une intervention urgente déborde presque toujours du créneau prévu, le temps réellement passé est celui qui remonte du terrain — pas celui qui avait été annoncé.
        </p>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="Les briques utiles au dépannage"
        chapo="Le planning et la fiche d'intervention font l'essentiel du travail."
        paths={[
          "/solutions/planning-interventions",
          "/solutions/gestion-interventions",
          "/solutions/devis-facturation",
          "/secteurs/cvc",
          "/secteurs/maintenance",
          "/secteurs/installation",
        ]}
      />

      <SolutionCta
        titre="Rejouons une de vos journées d'urgence."
        texte="Prenez une journée chargée récente : nous montrons comment elle se serait pilotée dans Argon."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
