import Link from "next/link";

import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { metadataFor, schemaIds, webPageSchema } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import {
  DIFFERENCIATION,
  FAQ_TARIFS,
  HORS_ABONNEMENT,
  MISE_EN_SERVICE,
  ENGAGEMENT,
  OPTIONS,
  PAIEMENT,
  PLANS,
  REDUCTION_ANNUELLE,
  REGLES_FACTURATION,
  SERVICES,
  SOCLE,
  formaterEuros,
} from "@/lib/tarifs";
import { ComparatifTarifs } from "@/components/tarifs/ComparatifTarifs";
import { SimulateursLies } from "@/components/tarifs/SimulateursLies";

/**
 * PAGE TARIFS — 19ᵉ page du site.
 *
 * ⚠️ CETTE PAGE EST LA SEULE EXCEPTION À LA RÈGLE ÉDITORIALE DU SITE.
 * Partout ailleurs, le site décrit le produit VISÉ. Ici, une ligne inscrite
 * dans une colonne payante est un ENGAGEMENT CONTRACTUEL. Ne jamais y porter
 * une fonction qui n'est pas livrée le jour où la page est en ligne.
 *
 * ⚠️ AUCUN PRIX EN DUR. Tout vient de `src/lib/tarifs.ts`, source unique.
 * Le JSON-LD `Offer` lit la même source : le prix balisé pour Google ne peut
 * pas diverger du prix affiché.
 *
 * ⚠️ Le H1 vient de `routes.ts`, jamais d'un littéral. L'accueil est la seule
 * page du site à faire l'inverse, et c'est une incohérence connue que
 * `seo:check` ne détecte pas. Ne pas la reproduire.
 *
 * ⚠️ Pas de fil d'Ariane, pas de `BreadcrumbList` : retirés au Lot 2. Les deux
 * vont ensemble, dans les deux sens.
 *
 * ⚠️ Aucune promesse chiffrée. Le simulateur de valeur n'affiche QUE de
 * l'arithmétique appliquée aux hypothèses que le visiteur a saisies lui-même.
 * Toujours « estimation de gains potentiels ». Un solde négatif s'affiche.
 */

const PATH = "/tarifs";

export const metadata = metadataFor(PATH);

/**
 * Balisage de l'offre — les prix viennent de `tarifs.ts`, jamais d'une copie.
 *
 * ⚠️ TYPE `SoftwareApplication`, JAMAIS `Product` — et jamais les deux.
 * `Product` déclare un article de catalogue vendu en ligne. Google applique
 * alors la grille marchande : `image`, `shippingDetails`,
 * `hasMerchantReturnPolicy`, `aggregateRating`, `review`. Cinq champs signalés
 * en Search Console le 26/08/2026, dont aucun n'est renseignable ici :
 * la page ne vend pas — pas de panier, pas de paiement — et Google réserve les
 * fiches de marchand aux pages « where a shopper can purchase a product ».
 * Un `"@type": ["Product", "SoftwareApplication"]` rallumerait les deux
 * rapports : le type mixte déclenche la même validation.
 *
 * ⚠️ `name` porte « part plateforme » et la `description` le répète.
 * Le balisage est servi HORS du tableau qui l'explique : un `lowPrice` nu se
 * lit « Argon coûte 149 € », alors que le coût réel est plateforme +
 * utilisateurs terrain actifs. Sur la seule page du site où une ligne publiée
 * est un engagement opposable, le prix balisé doit porter sa propre limite.
 *
 * ⚠️ Le prix par utilisateur terrain (`plan.terrain`) NE MONTE PAS ici.
 * `UnitPriceSpecification` n'exprime pas proprement « forfait + par siège
 * actif » ; une approximation deviendrait une seconde source de prix,
 * divergente de `tarifs.ts`. La règle de la source unique passe avant
 * l'exhaustivité du balisage.
 */
const offresSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Argon",
  description:
    "Plateforme de gestion des interventions terrain : demandes, devis, planning, interventions, comptes rendus, équipes et facturation.",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Gestion des interventions terrain",
  operatingSystem: "Web, iOS, Android",
  url: absoluteUrl(PATH),
  publisher: { "@id": schemaIds.organization },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    offerCount: PLANS.length,
    lowPrice: Math.min(...PLANS.map((plan) => plan.plateforme)),
    highPrice: Math.max(...PLANS.map((plan) => plan.plateforme)),
    offers: PLANS.map((plan) => ({
      "@type": "Offer",
      name: `Argon ${plan.libelle} — part plateforme`,
      description: `${plan.promesse} Part plateforme de l'abonnement mensuel ; les utilisateurs terrain actifs sont facturés en sus.`,
      url: absoluteUrl(PATH),
      price: plan.plateforme,
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: plan.plateforme,
        priceCurrency: "EUR",
        valueAddedTaxIncluded: false,
        /**
         * ⚠️ La périodicité se déclare par `referenceQuantity`, pas par
         * `unitText`. `unitText` est un libellé LIBRE, destiné à être lu :
         * y écrire « MON » — le code UN/CEFACT du mois — n'a de sens ni pour
         * une machine, qui attend ce code dans `unitCode`, ni pour un humain.
         * Le balisage disait donc « 149 € l'unité MON », c'est-à-dire rien.
         */
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: 1,
          unitCode: "MON", // UN/CEFACT : le mois
          unitText: "mois",
        },
      },
    })),
  },
};

const LIEN_PRIMAIRE =
  "inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const LIEN_SECONDAIRE =
  "inline-flex items-center justify-center rounded-lg border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function TarifsPage() {
  return (
    <>
      <JsonLd data={webPageSchema(PATH)} />
      <JsonLd data={offresSchema} />

      {/* ══ 1. HERO ═══════════════════════════════════════════════════ */}
      <SolutionHero
        path={PATH}
        eyebrow="Tarifs"
        chapo="Argon réunit vos clients, vos demandes, vos devis, vos interventions, vos équipes et votre facturation dans une seule plateforme."
      />

      {/* L'accroche chiffrée. Séparée du hero : SolutionHero ne prend pas
          d'enfants, et le prix mérite son propre palier de lecture. */}
      <Section className="border-b border-line-soft">
        <div className="max-w-3xl">
          <p className="text-lg font-semibold text-ink">
            À partir de {formaterEuros(PLANS[0].plateforme)} HT par mois,
            <span className="block font-normal text-ink-soft">
              plus vos utilisateurs terrain actifs.
            </span>
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Des tarifs affichés. Vous choisissez le niveau de plateforme qui
            correspond à votre organisation,{" "}
            <span className="font-medium text-ink">
              pas à la taille de votre équipe
            </span>
            .
          </p>
        </div>
      </Section>

      {/* ══ 2–3. LES TROIS OFFRES ET LA RÈGLE DE FACTURATION ══════════ */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          title="Trois niveaux, un seul produit."
          description="Le cœur d'Argon n'est pas réservé aux grandes entreprises. Ce qui change d'un niveau à l'autre, c'est le pilotage, pas le métier."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={[
                "flex flex-col rounded-2xl border bg-surface p-6 sm:p-8",
                plan.recommande
                  ? "border-accent shadow-lg ring-1 ring-accent"
                  : "border-line shadow-sm",
              ].join(" ")}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold text-ink">{plan.libelle}</h3>
                {plan.recommande && (
                  <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    Recommandé
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm font-medium uppercase tracking-wide text-ink-soft">
                {plan.verbe}
              </p>

              <p className="mt-6">
                <span className="text-4xl font-bold tabular-nums text-ink">
                  {formaterEuros(plan.plateforme)}
                </span>
                <span className="ml-2 text-sm text-ink-soft">HT / mois</span>
              </p>

              <p className="mt-2 text-sm tabular-nums text-ink-soft">
                + {formaterEuros(plan.terrain)} HT par utilisateur terrain actif
                et par mois
              </p>

              <p className="mt-5 flex-1 text-sm leading-relaxed text-ink-soft">
                {plan.promesse}
              </p>

              <p className="mt-6 border-t border-line-soft pt-5 text-sm leading-relaxed text-ink-soft">
                {DIFFERENCIATION[plan.id]}
              </p>

              <Link
                href="/demander-une-demo"
                className={`mt-6 w-full ${
                  plan.recommande ? LIEN_PRIMAIRE : LIEN_SECONDAIRE
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* La précision qui évite le malentendu le plus coûteux du modèle. */}
        <div className="mt-8 rounded-2xl bg-surface-alt p-6 sm:p-8">
          <p className="text-base font-semibold text-ink">
            Les utilisateurs bureau sont inclus. Vous ne payez que les
            utilisateurs terrain actifs.
          </p>
          <ul className="mt-4 space-y-2">
            {REGLES_FACTURATION.map((regle) => (
              <li key={regle} className="flex gap-3 text-sm text-ink-soft">
                <span aria-hidden="true" className="text-accent">
                  ·
                </span>
                <span>{regle}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ══ 4–7. SIMULATEURS, SOCLE, COMPARATIF ══════════════════════
          Le socle et le comparatif sont glissés ENTRE les deux simulateurs,
          via la prop `entreDeux`. Ce n'est pas une coquetterie de mise en
          page : le visiteur qui vient de voir son prix a besoin de savoir ce
          qu'il achète avant qu'on lui demande d'estimer ce qu'il perd. Et le
          plan choisi dans le premier simulateur alimente le second, sans qu'il
          le ressaisisse. */}
      <Section
        tone="alt"
        containerWidth="wide"
        className="border-b border-line-soft"
      >
        <SectionHeading
          title="Calculez votre tarif en quelques secondes."
          description="Un seul réglage. Les trois offres se recalculent ensemble, pour que vous compariez au lieu de calculer."
        />

        <div className="mt-10">
          <SimulateursLies
            entreDeux={
              <>
                {/* ── Le socle commun ──────────────────────────────── */}
                <div className="mt-20">
                  <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                    Toute votre activité. Dans toutes les offres.
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
                    Le cœur d&apos;Argon est disponible dès l&apos;offre
                    Essentiel. Les niveaux supérieurs ajoutent du pilotage et
                    des capacités d&apos;organisation avancées — pas le métier.
                  </p>

                  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {SOCLE.map((d) => (
                      <div
                        key={d.domaine}
                        className="rounded-2xl border border-line bg-surface p-6"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                          {d.domaine}
                        </p>
                        {/* Le bénéfice d'abord. L'inventaire ensuite. */}
                        <p className="mt-2 text-base font-semibold leading-snug text-ink">
                          {d.benefice}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                          {d.fonctions.join(" · ")}
                        </p>
                        {d.lien && (
                          <Link
                            href={d.lien}
                            className="mt-4 inline-block text-sm font-medium text-accent underline underline-offset-4"
                          >
                            Voir en détail
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Le comparatif ────────────────────────────────── */}
                <div className="mt-20">
                  <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                    Le détail, ligne par ligne.
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
                    De quoi arbitrer sans nous appeler.
                  </p>
                  <div className="mt-8">
                    <ComparatifTarifs />
                  </div>
                </div>

                {/* ── Le titre du simulateur de valeur ─────────────── */}
                <div className="mt-20" id="simulateur-valeur">
                  <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                    Combien vous coûte aujourd&apos;hui le fait de fonctionner
                    sans Argon ?
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">
                    Identifiez les heures perdues, les coûts évitables et la
                    capacité de production que votre organisation pourrait
                    récupérer.{" "}
                    <span className="font-medium text-ink">
                      Vous posez les hypothèses, nous ne faisons que
                      l&apos;arithmétique.
                    </span>
                  </p>
                </div>
              </>
            }
          />
        </div>

        {/* ── Le message après le ROI ──────────────────────────────── */}
        <div className="mt-16 rounded-2xl border-l-4 border-accent bg-surface p-6 sm:p-8">
          <p className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
            Le véritable coût n&apos;est peut-être pas Argon. C&apos;est le coût
            de continuer sans Argon.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-soft">
            Moins de ressaisie, moins de temps perdu, moins de dépenses engagées
            sans qu&apos;on les voie. Et surtout : une information saisie une
            fois, dont toutes les conséquences suivent — le planning, les
            heures, le compte rendu, la facture. C&apos;est ce qui ne se
            rattrape pas à la fin du mois.
          </p>
        </div>
      </Section>

      {/* ══ 8–10. MISE EN SERVICE, SERVICES, OPTIONS ═════════════════ */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          title="Votre démarrage est simple."
          description="Vous êtes autonome. Mais jamais seul."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Mise en service */}
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-ink">Mise en service</h3>
              <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                {MISE_EN_SERVICE.badge}
              </span>
            </div>

            <p className="mt-4">
              <span className="text-3xl font-bold tabular-nums text-ink">
                {formaterEuros(MISE_EN_SERVICE.prix)}
              </span>
              <span className="ml-2 text-sm text-ink-soft">HT, une fois</span>
            </p>

            <ul className="mt-6 space-y-2">
              {MISE_EN_SERVICE.comprend.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-ink-soft">
                  <span aria-hidden="true" className="text-accent">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t border-line-soft pt-5 text-sm leading-relaxed text-ink-soft">
              {MISE_EN_SERVICE.reserve}
            </p>
          </div>

          {/* Formation et assistance */}
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="text-lg font-bold text-ink">
              Formation et assistance
            </h3>

            <dl className="mt-6 divide-y divide-line-soft">
              {SERVICES.map((s) => (
                <div key={s.libelle} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <dt className="font-medium text-ink">{s.libelle}</dt>
                    <dd className="font-semibold tabular-nums text-ink">
                      {s.prix}
                    </dd>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{s.detail}</p>
                </div>
              ))}
            </dl>

            <p className="mt-6 rounded-lg bg-surface-alt px-4 py-3 text-sm leading-relaxed text-ink-soft">
              La distinction est nette : un défaut réel d&apos;Argon est corrigé
              sans être facturé. Une aide, une formation ou un paramétrage
              relèvent du tarif horaire. Un développement spécifique fait
              l&apos;objet d&apos;un devis, validé avant réalisation.
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h3 className="text-lg font-bold text-ink">Options</h3>
          <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {OPTIONS.map((o) => (
              <div
                key={o.libelle}
                className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-3"
              >
                <dt className="text-sm text-ink-soft">{o.libelle}</dt>
                <dd className="text-sm font-medium text-ink">{o.modalite}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ══ ENGAGEMENT ET PAIEMENT ═════════════════════════════════
          ⚠️ CONTENU CONTRACTUEL, arbitré par le dirigeant le 24/08/2026.
          Chaque ligne est opposable. Ne rien y reformuler sans décision.

          ⚠️ Le terme « sans engagement » est interdit sur tout le site, et
          ici il serait faux : l'engagement est de douze mois. La page le dit
          en clair — un prospect qui le découvre au contrat se retourne, un
          prospect qui le lit ici décide. */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          title="Ce que vous signez."
          description="Pas de découverte au moment du contrat."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="text-lg font-bold text-ink">Durée et engagement</h3>
            <dl className="mt-6 divide-y divide-line-soft">
              {ENGAGEMENT.map((e) => (
                <div key={e.libelle} className="py-4 first:pt-0 last:pb-0">
                  <dt className="font-medium text-ink">{e.libelle}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {e.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="text-lg font-bold text-ink">Règlement</h3>
            <dl className="mt-6 divide-y divide-line-soft">
              {PAIEMENT.map((p) => (
                <div key={p.libelle} className="py-4 first:pt-0 last:pb-0">
                  <dt className="font-medium text-ink">{p.libelle}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {p.detail}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 rounded-lg bg-surface-alt px-4 py-3 text-sm leading-relaxed text-ink-soft">
              Sur une offre Business à {formaterEuros(PLANS[1].plateforme)} HT
              par mois, régler l&apos;année en une fois représente{" "}
              <span className="font-medium text-ink">
                {formaterEuros(
                  PLANS[1].plateforme * 12 * (REDUCTION_ANNUELLE / 100),
                )}{" "}
                de moins sur l&apos;année
              </span>
              . La remise porte sur l&apos;abonnement plateforme uniquement :
              les utilisateurs terrain restent au tarif plein.
            </p>
          </div>
        </div>
      </Section>

      {/* ══ LA FRONTIÈRE ═════════════════════════════════════════════
          Elle est ici et pas ailleurs : sur une page de prix, dire ce qui
          n'est pas compris vaut mieux que de le découvrir sur une facture. */}
      <Section
        tone="alt"
        containerWidth="wide"
        className="border-b border-line-soft"
      >
        <SectionHeading
          title="Ce que l'abonnement ne comprend pas."
          description="Autant le dire ici plutôt qu'en démonstration."
        />

        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HORS_ABONNEMENT.map((h) => (
            <div
              key={h.libelle}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <dt className="font-semibold text-ink">{h.libelle}</dt>
              <dd className="mt-1 text-sm text-ink-soft">{h.detail}</dd>
            </div>
          ))}
        </dl>

        {/* ⚠️ FORMULE VERROUILLÉE — mot pour mot, partout où la frontière
            comptable apparaît. Une frontière reformulée cesse d'être une
            frontière. Ne jamais réécrire cette phrase. */}
        <p className="mt-8 max-w-3xl rounded-xl border-l-4 border-line bg-surface p-5 text-base leading-relaxed text-ink-soft">
          Argon ne tient pas votre comptabilité. Il prépare, centralise et
          alimente les informations et documents nécessaires à leur
          exploitation.
        </p>
      </Section>

      {/* ══ 11. FAQ ══════════════════════════════════════════════════ */}
      <SolutionFaq
        titre="Les questions qu'on nous pose sur le prix"
        items={[...FAQ_TARIFS]}
      />

      {/* ══ MAILLAGE ═════════════════════════════════════════════════ */}
      <RelatedPages
        titre="Ce que ces offres contiennent"
        chapo="Le prix est le même pour tous ces modules : ils font partie du socle."
        paths={[
          "/solutions/gestion-interventions",
          "/solutions/devis-facturation",
          "/solutions/heures-et-absences",
          "/solutions/transfert-comptable",
        ]}
      />

      {/* ══ 12. CTA FINAL ════════════════════════════════════════════
          Deux gestes, et c'est délibéré : le site n'en offrait qu'un seul,
          le plus engageant. « Calculer mes gains » est le palier intermédiaire
          qui manquait — il ne demande ni nom, ni téléphone. */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Voyez ce que ça donne sur votre organisation.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Décrivez-nous votre activité, nous vous montrons Argon sur vos
            propres cas — et nous vous dirons franchement si ce n&apos;est pas
            le bon outil pour vous.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/demander-une-demo" className={LIEN_PRIMAIRE}>
              Demander une démonstration
            </Link>
            <Link href="#simulateur-valeur" className={LIEN_SECONDAIRE}>
              Calculer mes gains
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
