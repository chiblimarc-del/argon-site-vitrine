import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { ReportDocument } from "@/components/product-ui/ReportDocument";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * PAGE SOLUTION — RAPPORTS D'INTERVENTION.
 *
 * PÉRIMÈTRE SEO — principal : « rapport d'intervention »
 * Secondaires : rapport intervention digital · compte rendu intervention ·
 * compte rendu technicien · rapport intervention terrain.
 *
 * ⚠️ Ne pas employer les mots-clés des pages voisines.
 *
 * ANGLE — LE DOCUMENT LUI-MÊME. L'étude de SERP montre que cette requête a une
 * intention distincte du reste du cluster : les gens cherchent un MODÈLE, un
 * formulaire, un document — pas une plateforme. La page montre donc le compte
 * rendu tel que le client le reçoit, avant de parler d'outil.
 *
 * RÈGLE DE VÉRITÉ : validé uniquement — génération du compte rendu en PDF à
 * la clôture, photos, signature du client, anomalie signalée, transmission
 * automatique au client, conservation sur la fiche du site.
 * INTERDIT : formulaires ou modèles personnalisables, check-lists
 * paramétrables, relevés techniques, conformité réglementaire, archivage à
 * valeur probante, signature électronique qualifiée.
 */

const PATH = "/solutions/rapports-intervention";

export const metadata = metadataFor(PATH);

/** Ce que contient le document. Rien qui ne soit produit par l'intervention. */
const contenu = [
  { cle: "L'identification", valeur: "Référence, client, site, intervenant, horaires réels." },
  { cle: "Ce qui a été fait", valeur: "La description saisie sur place par l'intervenant." },
  { cle: "Les photos", valeur: "Ce qui a été constaté et réalisé, prises pendant l'intervention." },
  { cle: "Les réserves", valeur: "L'anomalie signalée, s'il y en a une, avec ce qu'elle implique." },
  { cle: "La signature", valeur: "Celle du client, prise sur le mobile au moment de la clôture." },
];

const avant = [
  {
    titre: "Le carnet qui revient le vendredi",
    texte:
      "Écrit vite, entre deux interventions. Ressaisi au bureau par quelqu'un qui n'y était pas. Envoyé au client la semaine suivante, quand il a oublié le contexte.",
  },
  {
    titre: "Le modèle Word que chacun remplit à sa façon",
    texte:
      "Deux techniciens, deux niveaux de détail. Impossible de comparer deux passages sur le même site, ni de retrouver celui de mars.",
  },
  {
    titre: "La photo restée dans le téléphone",
    texte:
      "Prise sur place, jamais transférée. Elle existe, mais personne ne sait où — et surtout pas au moment où le client conteste.",
  },
];

const faq: QuestionFaq[] = [
  {
    question: "Comment le compte rendu est-il produit ?",
    answer:
      "Il est produit en PDF à la clôture de l'intervention, à partir de ce que l'intervenant a saisi sur place : description, photos, signature du client, sans que personne ne le rédige au bureau.",
  },
  {
    question: "Le compte rendu est-il envoyé au client automatiquement ?",
    answer:
      "Oui, à la clôture. Si une anomalie a été signalée, elle remonte en parallèle à l'exploitation, qui décide de ce qui sera facturé — et le client en est informé le jour même. C'est cette trace, datée, qui fera tenir le supplément au moment de la facture.",
  },
  {
    question: "Peut-on retrouver un compte rendu plusieurs mois après ?",
    answer:
      "Oui. Chaque compte rendu reste rattaché à son intervention, elle-même rattachée au client et au site. Retrouver ce qui a été fait sur un site en mars se fait depuis la fiche de ce site, sans fouiller de messagerie.",
  },
  {
    question: "Peut-on personnaliser le modèle de compte rendu ?",
    answer:
      "Non. Le compte rendu suit un format unique, alimenté par ce qui a été saisi pendant l'intervention. Il n'y a ni éditeur de modèle, ni formulaire paramétrable, ni check-list configurable. Si votre besoin porte sur des formulaires métier sur mesure, il faut le savoir dès maintenant.",
  },
  {
    question: "La signature du client a-t-elle une valeur juridique particulière ?",
    answer:
      "C'est une signature manuscrite recueillie sur écran, attachée au compte rendu — pas une signature électronique qualifiée au sens du règlement eIDAS. Elle sert de preuve de réalisation dans la relation commerciale courante, ce qui est son usage réel sur le terrain.",
  },
];

export default function RapportsInterventionPage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="Rapports d'intervention"
        accentue="sans ressaisie"
        chapo="Le compte rendu est le seul document que votre client lit vraiment. Dans Argon, il se remplit sur le terrain pendant l'intervention, et part signé à la clôture."
      />

      {/* ---------- Le document ---------- */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Le compte rendu"
          title="Voilà ce que reçoit votre client."
          description="Rien dans ce document n'a été écrit au bureau : tout provient de l'intervention elle-même."
          className="max-w-3xl"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <dl className="space-y-7">
            {contenu.map((element) => (
              <div key={element.cle}>
                <dt className="text-[16px] font-semibold text-ink">{element.cle}</dt>
                <dd className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                  {element.valeur}
                </dd>
              </div>
            ))}
          </dl>

          <div className="min-w-0 lg:sticky lg:top-24">
            <ReportDocument />
          </div>
        </div>

        {/*
          Le lien de suivi, ajouté le 19/08/2026 après contrôle produit.

          Placé ici et nulle part ailleurs sur cette page : la section demande
          « ce que reçoit votre client », et le compte rendu n'est pas la
          première chose qu'il reçoit — le lien part bien avant, dès la
          première étape validée.

          Aucun nouveau titre : ce n'est pas une intention de recherche de plus,
          c'est un prolongement de celle-ci.

          Le jeton de suivi est porté par la MISSION (`lienSuiviToken`), pas par
          une entité propre au transport : le mécanisme vaut pour tous les
          métiers. Vérifié dans le code du SaaS, pas déduit.
        */}
        <p className="mt-12 max-w-3xl border-l-2 border-line pl-5 text-[15px] leading-relaxed text-ink-soft">
          <span className="font-medium text-ink">
            Et votre client n&apos;a pas à vous appeler pour savoir où ça en
            est.
          </span>{" "}
          Dès que l&apos;intervenant valide sa première étape, un lien part au
          client : il suit l&apos;avancement lui-même, et récupère le compte
          rendu à la fin. Ce qui vous vaut le moins d&apos;appels, ce
          n&apos;est pas de mieux répondre — c&apos;est de ne plus être la
          seule source d&apos;information.
        </p>
      </Section>

      {/* ---------- Ce que ça remplace ---------- */}
      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Ce que ça remplace"
          title="Trois habitudes qui coûtent surtout le jour où le client conteste."
          className="max-w-3xl"
        />
        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {avant.map((element) => (
            <li key={element.titre} className="card p-6">
              <h3 className="text-[16px] font-semibold text-ink">{element.titre}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {element.texte}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Le compte rendu qui ne part pas ---------- */}
      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Le meilleur compte rendu est parfois celui qui ne part pas.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            Un supplément qu&apos;on découvre au moment de la facture se
            discute. Un supplément signalé le jour où il s&apos;est produit,
            daté et notifié au client, se constate.{" "}
            <span className="font-medium text-ink">
              Une anomalie signalée sur le terrain suspend la facturation, pas
              l&apos;information
            </span>{" "}
            : le client est prévenu, et c&apos;est vous qui décidez de ce qui
            sera facturé. Argon prépare la décision ; il ne la prend pas à
            votre place.
          </p>
        </div>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="D'où vient le compte rendu"
        chapo="Il est produit par l'intervention et alimente la facture."
        paths={[
          "/solutions/application-mobile-technicien",
          "/solutions/gestion-interventions",
          "/solutions/devis-facturation",
          "/secteurs/maintenance",
          "/secteurs/installation",
          "/secteurs/cvc",
        ]}
      />

      <SolutionCta
        titre="Comparez avec votre compte rendu actuel."
        texte="Apportez un de vos rapports récents : nous montrons ce qu'Argon aurait produit."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
