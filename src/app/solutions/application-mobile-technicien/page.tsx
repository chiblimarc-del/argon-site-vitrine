import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { MobilePanel } from "@/components/product-ui/MobilePanel";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * PAGE SOLUTION — APPLICATION MOBILE TECHNICIEN.
 *
 * PÉRIMÈTRE SEO — principal : « application mobile technicien terrain »
 * Secondaires : application intervention terrain · application technicien ·
 * application gestion interventions · logiciel technicien terrain ·
 * application suivi intervention.
 *
 * ⚠️ Ne pas employer les mots-clés des pages voisines.
 *
 * ANGLE — LE POINT DE VUE DU TERRAIN. Les cinq autres pages parlent depuis le
 * bureau. Celle-ci parle depuis la camionnette : ce que l'intervenant a sous
 * les yeux, et ce qu'on lui demande de faire. C'est aussi le seul écran du
 * produit que le dirigeant ne voit jamais — d'où l'intérêt de le montrer.
 *
 * RÈGLE DE VÉRITÉ : validé uniquement — réception de la mission, informations
 * du site, statuts, photos, signature du client, signalement d'anomalie,
 * compte rendu, consultation du planning affecté.
 * INTERDIT ABSOLU : mode hors-ligne (extension FUTURE au schéma V1),
 * navigation/itinéraire/carte embarquée, géolocalisation, pointage, heures,
 * notes de frais, scan, stocks, IA.
 */

const PATH = "/solutions/application-mobile-technicien";

export const metadata = metadataFor(PATH);

const journee = [
  {
    titre: "Il sait où il va, et pour qui",
    texte:
      "La mission arrive avec le client, le site et le contact sur place. Plus d'adresse dictée au téléphone le matin, ni de papier oublié sur le tableau de bord.",
  },
  {
    titre: "Il documente pendant, pas après",
    texte:
      "Les photos se prennent au moment où il constate. Le compte rendu se remplit sur place, quand tout est encore sous les yeux.",
  },
  {
    titre: "Il fait signer avant de repartir",
    texte:
      "Le client valide sur l'écran. La preuve est prise à chaud, pas reconstituée trois jours plus tard depuis le bureau.",
  },
  {
    titre: "Il signale ce qui cloche",
    texte:
      "Une pièce manquante, un accès impossible, une prestation à revoir : il le remonte depuis l'application. L'information arrive au bureau sans attendre son retour.",
  },
];

const bureau = [
  {
    titre: "Moins d'appels",
    texte:
      "« Tu es où ? » « Tu as fini ? » Les statuts remontent d'eux-mêmes au fil de l'intervention.",
  },
  {
    titre: "Moins de ressaisie",
    texte:
      "Ce qui est saisi sur le terrain est déjà dans la fiche. Personne ne recopie un carnet le lendemain matin.",
  },
  {
    titre: "Moins d'attente",
    texte:
      "Le compte rendu existe à la clôture, pas en fin de semaine quand les papiers reviennent.",
  },
];

const faq: QuestionFaq[] = [
  {
    question: "Que voit le technicien dans l'application ?",
    answer:
      "Les missions qui lui sont affectées, avec leur créneau, le client, le site et le contact sur place. Depuis la mission, il change le statut, ajoute des photos, signale une anomalie et fait signer le client.",
  },
  {
    question: "L'application fonctionne-t-elle sans réseau ?",
    answer:
      "Non, pas aujourd'hui. L'application nécessite une connexion. Le fonctionnement hors ligne fait partie des évolutions envisagées, mais il ne fait pas partie des fonctions disponibles — et nous préférons le dire plutôt que de vous le faire découvrir sur un site en sous-sol.",
  },
  {
    question: "Le technicien voit-il les interventions précédentes du site ?",
    answer:
      "L'intervention qu'il reçoit est rattachée à son client et à son site, et l'historique des passages est conservé sur cette fiche. C'est ce qui évite de repartir de zéro sur une installation déjà connue de l'entreprise.",
  },
  {
    question: "L'application propose-t-elle un itinéraire ou un suivi GPS ?",
    answer:
      "Non. Il n'y a ni navigation embarquée, ni calcul d'itinéraire, ni suivi de position du technicien. Ce que le bureau suit, c'est l'avancement des interventions — pas le déplacement des personnes.",
  },
  {
    question: "Le client voit-il l'avancement de l'intervention ?",
    answer:
      "Oui. Dès que l'intervenant valide sa première étape sur son téléphone, un lien part au client : il suit l'avancement lui-même et récupère le compte rendu à la fin. Ce que le technicien valide sur le terrain est ce que le client voit.",
  },
  {
    question: "Que se passe-t-il quand le technicien clôture sa mission ?",
    answer:
      "Le compte rendu est généré en PDF avec les photos et la signature, puis transmis au client. Si le technicien a signalé une anomalie, elle remonte à l'exploitation, qui décide s'il y a un supplément à facturer.",
  },
];

export default function ApplicationMobilePage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="Application mobile"
        accentue="les bonnes informations au bon moment"
        chapo="C'est le seul écran d'Argon que vous ne verrez jamais en travaillant : celui de vos intervenants. Il tient dans une main, entre deux gestes, souvent avec des gants."
      />

      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Une journée côté terrain"
          title="Ce que le technicien a réellement sous les yeux."
          description="Une application de terrain se juge à une chose : est-ce qu'elle fait gagner du temps à celui qui l'utilise, ou est-ce qu'elle lui en prend ?"
          className="max-w-3xl"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-16">
          <dl className="space-y-8">
            {journee.map((element) => (
              <div key={element.titre}>
                <dt className="text-[16px] font-semibold text-ink">{element.titre}</dt>
                <dd className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                  {element.texte}
                </dd>
              </div>
            ))}
          </dl>

          <div className="min-w-0 lg:sticky lg:top-24">
            <MobilePanel />
          </div>
        </div>
      </Section>

      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Ce que ça change au bureau"
          title="Le mobile ne sert pas qu'au technicien."
          description="Chaque information saisie sur place est une information que personne n'aura à demander, ni à ressaisir."
          className="max-w-3xl"
        />
        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {bureau.map((element) => (
            <li key={element.titre} className="card p-6">
              <h3 className="text-[16px] font-semibold text-ink">{element.titre}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {element.texte}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Il faut une connexion.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            L&apos;application ne fonctionne pas hors ligne aujourd&apos;hui.
            Sur un site en sous-sol ou dans une zone mal couverte, la saisie
            devra attendre le retour du réseau.{" "}
            <span className="font-medium text-ink">
              C&apos;est une limite réelle, autant la connaître maintenant
            </span>{" "}
            : elle se découvre très vite en exploitation, et il vaut mieux
            qu&apos;elle figure sur un site que dans un premier retour terrain.
          </p>
        </div>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="Ce que le mobile alimente"
        chapo="Tout ce que l'intervenant saisit sur place remonte dans ces briques."
        paths={[
          "/solutions/rapports-intervention",
          "/solutions/gestion-interventions",
          "/solutions/planning-interventions",
          "/secteurs/maintenance",
          "/secteurs/depannage",
          "/secteurs/transport-courses",
        ]}
      />

      <SolutionCta
        titre="Faites-la essayer à un de vos techniciens."
        texte="C'est lui qui l'utilisera tous les jours : c'est son avis qui compte le plus."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
