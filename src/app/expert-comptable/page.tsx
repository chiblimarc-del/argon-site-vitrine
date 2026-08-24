/**
 * /expert-comptable — 20ᵉ page du site
 *
 * ─── POURQUOI CETTE PAGE ──────────────────────────────────────
 *
 * Le cabinet est PRESCRIPTEUR : c'est souvent lui qui recommande l'outil de
 * gestion à ses clients. Argon lui donne son propre accès, cloisonné en
 * lecture seule. Et le site ne lui a jamais parlé — pas une page, pas un
 * paragraphe, pas un titre. C'est le troisième avantage sous-exploité de
 * l'audit du 20/08.
 *
 * ─── L'AUDIENCE CHANGE TOUT ───────────────────────────────────
 *
 * Cette page ne s'adresse PAS au dirigeant. Elle s'adresse au cabinet, et elle
 * doit pouvoir être transmise telle quelle : « envoyez ce lien à votre
 * comptable » est le geste qu'elle rend possible.
 *
 * Conséquence de rédaction : on ne vend pas, on informe. Un expert-comptable
 * qui sent qu'on lui vend quelque chose se méfie du logiciel de son client.
 * La section frontière n'est donc pas une précaution ici — c'est l'argument
 * principal.
 *
 * ─── L'AXE ────────────────────────────────────────────────────
 *
 * Page de niveau racine, comme `/tarifs`, `/a-propos` et `/contact`. Ce n'est
 * ni une brique de la chaîne, ni un domaine du socle tarifaire : c'est une
 * page d'AUDIENCE. Ne pas la ranger sous `/solutions` — elle apparaîtrait
 * dans `childrenOf` et polluerait la chaîne à sept.
 *
 * ─── FRONTIÈRE AVEC /solutions/transfert-comptable ────────────
 *
 *   transfert-comptable → ce que le DIRIGEANT envoie. Son intention, son
 *                          vocabulaire, sa requête.
 *   expert-comptable    → ce que le CABINET reçoit, et ce qu'il peut aller
 *                          chercher lui-même.
 *
 * ⚠️ Ne jamais employer ici le mot-clé de l'autre page — « transmettre ses
 * factures à son expert-comptable ». Les deux pages se cannibaliseraient sur
 * la seule requête que le site tienne sur ce sujet.
 *
 * ─── VOCABULAIRE INTERDIT, repris du Lot 3 ────────────────────
 *
 * FEC · API, intégration, synchronisation, connecteur · automatiquement, en
 * temps réel · tout nom de logiciel comptable · écritures, partie double,
 * rapprochement bancaire · toute formulation laissant entendre qu'Argon
 * produit une déclaration de TVA.
 *
 * ⚠️ ET LE PARAMÉTRAGE AUX CODES COMPTABLES N'EXISTE PAS. Quatre des cinq
 * champs de l'onglet Comptabilité ne sont lus par aucun code — registre de
 * dette technique, entrée 6. Ne pas l'annoncer ici sous prétexte qu'on parle
 * à un comptable : ce serait exactement le public qui s'en apercevrait.
 */

import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SolutionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";

import { metadataFor, webPageSchema } from "@/lib/seo";

const PATH = "/expert-comptable";

export const metadata = metadataFor(PATH);

/** La formule verrouillée. Mot pour mot, partout. */
const FORMULE =
  "Argon ne tient pas votre comptabilité. Il prépare, centralise et alimente les informations et documents nécessaires à leur exploitation.";

const EXTRACTIONS = [
  {
    nom: "Ventes",
    format: "CSV",
    portee: "un mois",
    contenu:
      "Numéro, date de facture, date d'échéance, client, HT, TVA, TTC, statut.",
  },
  {
    nom: "Règlements",
    format: "CSV",
    portee: "un mois",
    contenu:
      "Date, numéro de facture, client, montant, moyen de paiement, référence.",
  },
  {
    nom: "Récapitulatif de TVA",
    format: "CSV",
    portee: "un mois",
    contenu: "Base HT, TVA et TTC par taux, avec une ligne de total.",
  },
  {
    nom: "Factures",
    format: "ZIP",
    portee: "un mois",
    contenu:
      "Un PDF par facture numérotée. Les brouillons sont exclus : sans numéro, une facture n'existe pas.",
  },
  {
    nom: "Avoirs",
    format: "CSV",
    portee: "un mois",
    contenu: "Numéro, date, client, facture liée, motif, HT, TVA, TTC.",
  },
  {
    nom: "Clients",
    format: "CSV",
    portee: "l'ensemble",
    contenu:
      "Raison sociale, contact, e-mail, téléphone, adresse, SIRET, forme juridique, statut.",
  },
] as const;

const FAQ = [
  {
    question: "Argon produit-il un fichier d'écritures ?",
    answer: `Non. Il produit six extractions au format tableur, plus les factures en PDF. ${FORMULE}`,
  },
  {
    question: "Puis-je accéder au dossier de mon client sans le déranger ?",
    answer:
      "Oui, s'il vous ouvre un accès. C'est lui qui le crée, et c'est lui qui peut le retirer — nous n'intervenons pas dans cette décision.",
  },
  {
    question: "Cet accès est-il un espace dédié aux experts-comptables ?",
    answer:
      "Non, et la nuance compte. Ce sont les rôles de l'application appliqués à quelqu'un d'extérieur : votre client vous ouvre le module comptable, en lecture seule, et rien d'autre. Ce n'est pas un espace séparé, c'est un périmètre restreint dans le sien.",
  },
  {
    question: "Puis-je paramétrer des codes comptables ou un journal de ventes ?",
    answer:
      "Non, pas aujourd'hui. Les extractions produisent des colonnes fixes. Nous préférons vous le dire ici plutôt que vous le laisser découvrir au premier export.",
  },
  {
    question: "Argon produit-il une déclaration de TVA ?",
    answer:
      "Non. Le récapitulatif de TVA est un état de ce qui a été facturé, par taux. Ce n'est pas une déclaration et il n'a pas vocation à en tenir lieu.",
  },
  {
    question: "Que se passe-t-il si une extraction échoue ?",
    answer:
      "Rien n'est marqué comme transmis. L'horodatage est posé après la production du fichier, jamais avant : une extraction qui échoue ne laisse pas derrière elle des factures annoncées comme reprises alors que rien n'est parti.",
  },
];

const LIEN_PRIMAIRE =
  "inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const LIEN_SECONDAIRE =
  "inline-flex items-center justify-center rounded-lg border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function ExpertComptablePage() {
  return (
    <>
      <JsonLd data={webPageSchema(PATH)} />

      <SolutionHero
        path={PATH}
        eyebrow="Experts-comptables"
        chapo="Vos clients qui interviennent sur le terrain vous envoient leurs pièces en retard, en désordre, et deux fois. Voici ce qu'Argon change à ça — et ce qu'il ne change pas."
      />

      {/* ══ 1. CE QUE VOUS RECEVEZ ════════════════════════════ */}
      <Section>
        <SectionHeading title="Six extractions, aux colonnes connues d'avance." />
        <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
          Elles couvrent un mois — sauf le fichier clients, qui porte
          l&apos;ensemble. Le contenu ne varie pas d&apos;un dossier à l&apos;autre : ce que
          vous voyez ici est ce que vous recevrez.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXTRACTIONS.map((e) => (
            <div
              key={e.nom}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-ink">{e.nom}</h3>
                <span className="rounded bg-surface-alt px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                  {e.format}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">Portée : {e.portee}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {e.contenu}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-3xl rounded-xl border-l-4 border-line bg-surface-alt p-5 text-base leading-relaxed text-ink-soft">
          {FORMULE}
        </p>
      </Section>

      {/* ══ 2. L'ACCÈS ════════════════════════════════════════ */}
      <Section tone="alt">
        <SectionHeading title="Vous n'attendez plus qu'on vous les envoie." />
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-ink-soft">
              Votre client peut vous ouvrir un accès limité au module
              comptable, en lecture seule. Vous allez chercher ce dont vous avez
              besoin, quand vous en avez besoin, sans relancer personne et sans
              voir le reste de son activité.
            </p>

            <p className="rounded-xl border-l-4 border-line bg-surface p-5 text-base leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">
                Ce que ça évite :
              </strong>{" "}
              le troisième e-mail du 12 du mois, et le fichier reçu deux fois en
              deux versions.
            </p>

            <p className="text-base leading-relaxed text-ink-soft">
              C&apos;est votre client qui crée cet accès, et lui seul qui peut le
              retirer. Nous n&apos;intervenons pas dans cette décision, et nous ne
              vous contacterons pas de notre côté.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="text-base font-semibold text-ink">
              Ce n&apos;est pas un « espace expert-comptable », et c&apos;est mieux ainsi
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Ce sont les rôles de l&apos;application appliqués à quelqu&apos;un
              d&apos;extérieur : un rôle peut n&apos;ouvrir que le module comptable, sur
              son axe lecture. Pas un espace séparé — un périmètre restreint
              dans celui de votre client.
            </p>
            <p className="mt-4 border-t border-line-soft pt-4 text-sm leading-relaxed text-ink-soft">
              La conséquence pratique est celle qui vous intéresse : ce que vous
              lisez est exactement ce que voit votre client, au même instant.
              Pas une copie exportée la veille, pas une version intermédiaire.
              Il n&apos;y a rien à réconcilier entre vous.
            </p>
          </div>
        </div>
      </Section>

      {/* ══ 3. L'HORODATAGE ═══════════════════════════════════ */}
      <Section>
        <SectionHeading title="Ce qui est parti chez vous est daté sur la facture elle-même." />
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-ink-soft">
              Deux extractions marquent les factures qu&apos;elles emportent : les
              ventes et l&apos;archive des PDF. La date est posée{" "}
              <strong className="font-semibold text-ink">
                après que le fichier a été produit
              </strong>
              , jamais avant.
            </p>

            <p className="text-base leading-relaxed text-ink-soft">
              L&apos;ordre n&apos;est pas un détail d&apos;implémentation. S&apos;il était inverse,
              une extraction interrompue laisserait derrière elle des factures
              annoncées comme reprises alors que rien n&apos;est parti — et ce sont
              exactement celles qui manqueraient à la clôture.
            </p>

            <p className="rounded-xl border-l-4 border-line bg-surface-alt p-5 text-base leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">
                Ce que ça évite :
              </strong>{" "}
              la question « est-ce que vous me l&apos;aviez envoyée ? », à laquelle
              ni vous ni votre client ne pouvez répondre.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="text-base font-semibold text-ink">
              Les quatre autres ne datent rien, et c&apos;est voulu
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Un récapitulatif de TVA, un fichier clients, un état des
              règlements ou des avoirs décrivent un état à un instant. Ils ne
              constatent pas un envoi.
            </p>
            <p className="mt-4 border-t border-line-soft pt-4 text-sm leading-relaxed text-ink-soft">
              Les marquer aussi donnerait l&apos;impression que six choses ont été
              transmises alors que deux seulement l&apos;ont été au sens où vous
              l&apos;entendez. La nuance est petite ; elle est de celles qui coûtent
              une demi-journée en fin d&apos;exercice.
            </p>
          </div>
        </div>
      </Section>

      {/* ══ 4. LA FRONTIÈRE — l'argument principal ════════════ */}
      <Section tone="alt">
        <SectionHeading title="Ce qu'Argon ne fait pas." />
        <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
          Autant que vous le sachiez maintenant, plutôt qu&apos;au premier export.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              t: "Aucun fichier d'écritures",
              d: "Six extractions au format tableur et les factures en PDF. Rien qui prétende se déverser dans un outil comptable.",
            },
            {
              t: "Aucun paramétrage de codes comptables",
              d: "Les colonnes sont fixes : ni code client, ni journal, ni préfixe de libellé. Le jour où ce sera le cas, nous l'écrirons ici.",
            },
            {
              t: "Aucune déclaration",
              d: "Le récapitulatif de TVA est un état de ce qui a été facturé, par taux. Il ne tient lieu d'aucune déclaration.",
            },
            {
              t: "Aucun rapprochement bancaire",
              d: "Argon enregistre les règlements que votre client saisit. Il ne les confronte à aucun relevé.",
            },
          ].map((f) => (
            <li
              key={f.t}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <p className="font-semibold text-ink">{f.t}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {f.d}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-3xl rounded-xl border-l-4 border-accent bg-surface p-5 text-base leading-relaxed text-ink-soft">
          Argon travaille en amont de vous, pas à votre place. Ce qu&apos;il produit
          est censé vous faire gagner la partie du travail qui consiste à
          réclamer des pièces — pas celle pour laquelle vos clients vous
          paient.
        </p>
      </Section>

      <SolutionFaq titre="Les questions qu'on nous pose" items={FAQ} />

      <RelatedPages
        titre="Ce que voit votre client"
        paths={[
          "/solutions/transfert-comptable",
          "/solutions/devis-facturation",
        ]}
      />

      {/* ══ CTA — on ne vend pas à un prescripteur ════════════ */}
      <Section tone="alt">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">
            Dites-nous ce qui vous manquerait.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Vous savez mieux que nous ce qui rend un dossier client pénible à
            traiter. Si ce que vous recevriez d&apos;Argon ne suffit pas, la réponse
            utile est de nous le dire — pas de vous convaincre du contraire.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className={LIEN_PRIMAIRE}>
              Nous écrire
            </Link>
            <Link
              href="/solutions/transfert-comptable"
              className={LIEN_SECONDAIRE}
            >
              Voir ce que votre client transmet
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
