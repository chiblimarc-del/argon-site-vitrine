import { Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema, breadcrumbSchema } from "@/lib/seo";

/**
 * PAGE À PROPOS.
 *
 * ⚠️ RÈGLE ABSOLUE POUR CETTE PAGE : aucune biographie, aucune date de
 * création, aucune équipe, aucun parcours, aucun effectif, aucune levée de
 * fonds, aucun chiffre. Rien de tout cela n'est vérifiable, et une page « à
 * propos » est précisément l'endroit où un visiteur va chercher à savoir à qui
 * il a affaire — une invention y coûte plus cher qu'ailleurs.
 *
 * Ce qui est légitime et vérifiable : le constat opérationnel qui a présidé à
 * la conception, les choix de conception eux-mêmes (ils se lisent dans le
 * produit), et ce que le produit ne cherche pas à faire.
 *
 * Ce n'est PAS une page de positionnement SEO : `keyword: null` au registre.
 * Son rôle est de rassurer, pas d'attirer.
 */

const PATH = "/a-propos";

export const metadata = metadataFor(PATH);

/** Le constat. Formulé comme une observation de métier, jamais comme un récit. */
const constat = [
  {
    titre: "L'information existe, elle est ailleurs",
    texte:
      "Dans une entreprise d'intervention, personne ne manque d'informations. Elles sont dans un SMS, un tableur, un appel, un carnet. Le problème n'est pas de les produire : c'est qu'elles ne sont jamais au même endroit au même moment.",
  },
  {
    titre: "Le bureau et le terrain ne parlent pas la même langue",
    texte:
      "Les outils de gestion s'arrêtent à la porte de l'entreprise. Les outils de terrain s'arrêtent au compte rendu. Entre les deux, quelqu'un ressaisit — et c'est là que les écarts apparaissent.",
  },
  {
    titre: "Ce qui coûte n'est pas ce qu'on croit",
    texte:
      "Rarement l'intervention elle-même. Plutôt le devis qu'on a oublié de relancer, l'intervention réalisée qui n'arrive jamais sur une facture, le compte rendu qui revient en fin de semaine.",
  },
];

/** Les choix de conception. Chacun est observable dans le produit. */
const choix = [
  {
    numero: "01",
    titre: "Une donnée saisie une fois",
    texte:
      "Le devis devient une intervention, l'intervention devient un compte rendu, le compte rendu devient une facture. C'est le même enregistrement qui traverse la chaîne. Tout le reste du produit découle de ce principe.",
  },
  {
    numero: "02",
    titre: "Montrer, pas décider à votre place",
    texte:
      "Argon n'optimise pas vos tournées, ne désigne pas le technicien à envoyer, ne relance pas vos clients. Il vous donne la visibilité pour arbitrer vite. Dans une exploitation, ce n'est presque jamais l'algorithme qui manque : c'est l'information au bon moment.",
  },
  {
    numero: "03",
    titre: "Un point de contrôle avant la facture",
    texte:
      "Une intervention terminée n'est pas forcément une intervention conforme. Quand le technicien signale une anomalie, rien ne part automatiquement au client : l'intervention est mise en attente et quelqu'un décide. C'est le choix le moins spectaculaire du produit, et probablement le plus utile.",
  },
  {
    numero: "04",
    titre: "Dire ce que le produit ne fait pas",
    texte:
      "Chaque page de ce site indique ses limites : pas de tenue de comptabilité, pas d'optimisation automatique, pas de mode hors ligne, pas de suivi GPS. Une limite découverte en démonstration coûte une démonstration. Découverte après la signature, elle coûte un client.",
  },
];

export default function AProposPage() {
  return (
    <>
      <Breadcrumbs path={PATH} />

      <SolutionHero
        path={PATH}
        eyebrow="À propos"
        accentue="pour les équipes terrain"
        chapo="Argon est né d'un constat d'exploitation, pas d'une idée de logiciel : dans les entreprises qui travaillent hors de leurs murs, l'information circule mal entre ceux qui vendent, ceux qui planifient et ceux qui exécutent."
      />

      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          as="h2"
          eyebrow="Le constat de départ"
          title="Trois choses qu'on observe dans presque toutes les exploitations."
          className="max-w-3xl"
        />
        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {constat.map((element) => (
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
          eyebrow="Nos choix de conception"
          title="Quatre décisions qui expliquent le reste."
          description="Elles ne se voient pas sur une liste de fonctionnalités, mais elles orientent chaque écran du produit."
          className="max-w-3xl"
        />
        <ol className="mt-14 grid gap-x-12 gap-y-10 lg:grid-cols-2">
          {choix.map((element) => (
            <li key={element.numero}>
              <span className="font-mono text-[12px] text-accent-text">
                {element.numero}
              </span>
              <h3 className="mt-2.5 text-[18px] font-semibold text-ink">
                {element.titre}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
                {element.texte}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Ce que vous ne trouverez pas sur ce site.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            Pas de logos de grands comptes que nous n&apos;aurions pas comme
            clients. Pas de témoignages écrits à notre place. Pas de
            pourcentages de gain de productivité que personne n&apos;a mesurés.
            Pas de fonctionnalité annoncée parce qu&apos;elle est prévue.{" "}
            <span className="font-medium text-ink">
              Ce que vous lisez ici correspond à ce que le produit fait
              aujourd&apos;hui
            </span>{" "}
            — c&apos;est une contrainte que nous nous sommes donnée, et elle
            explique pourquoi ce site est plus sobre que la moyenne de son
            marché.
          </p>
        </div>
      </Section>

      {/* Maillage volontairement court : les deux axes et la conversion.
          Cette page n'a pas vocation à rejouer la navigation du site. */}
      <RelatedPages
        titre="Aller voir le produit"
        chapo="Le plus simple pour juger reste de regarder ce que fait chaque brique, et comment elle se traduit dans votre métier."
        paths={["/solutions", "/secteurs", "/demander-une-demo"]}
      />

      <SolutionCta
        titre="La meilleure façon de juger reste de voir."
        texte="Une démonstration sur votre activité, avec vos types de missions et votre organisation."
      />

      <JsonLd data={webPageSchema(PATH)} />
      <JsonLd data={breadcrumbSchema(PATH)} />
    </>
  );
}
