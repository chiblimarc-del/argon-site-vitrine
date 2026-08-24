import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { SolutionHero } from "@/components/sections/solution/SolutionHero";
import { SolutionFaq, type QuestionFaq } from "@/components/sections/solution/SolutionFaq";
import { RelatedPages } from "@/components/sections/solution/RelatedPages";
import { SolutionCta } from "@/components/sections/solution/SolutionCta";
import { metadataFor, webPageSchema } from "@/lib/seo";
import { GrilleHeuresPanel } from "@/components/mockups/GrilleHeuresPanel";

/**
 * PAGE SOLUTION — HEURES ET ABSENCES.
 *
 * Modèle verrouillé, repris sans modification :
 * SolutionHero → corps propre → SolutionFaq → RelatedPages → SolutionCta.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PREMIÈRE PAGE ÉCRITE AVEC LA MÉCANIQUE ÉDITORIALE.
 *
 * Chaque section porte les quatre temps, dans cet ordre et jamais un autre :
 *   1. le bénéfice (le H2)   3. ce que ça évite
 *   2. le comment            4. la preuve
 *
 * Un bloc qui s'arrête à l'étape 2 est un catalogue. Un bloc qui saute
 * l'étape 1 est une notice.
 * ─────────────────────────────────────────────────────────────────────────
 * PÉRIMÈTRE SEO — principal : « logiciel suivi des heures et des congés »
 * Secondaires : suivi des heures salariés · gestion des absences entreprise ·
 * congés et absences terrain · récapitulatif mensuel des heures · heures
 * supplémentaires suivi.
 *
 * ⚠️ « logiciel de gestion des temps » a été ÉCARTÉ : c'est la tête de marché
 * des badgeuses et des SIRH, et celui qui la tape cherche une pointeuse.
 *
 * ⚠️ FRONTIÈRE AVEC LA PAGE PLANNING
 *   /solutions/planning-interventions → l'ARBITRAGE de la journée
 *   /solutions/heures-et-absences     → le COMPTAGE du temps
 * Ne jamais employer « logiciel planning interventions » ici.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ⚠️⚠️ CETTE PAGE TOUCHE À LA PAIE SANS EN FAIRE. C'est le second terrain
 * glissant du site après la comptabilité : un dirigeant qui croit acheter un
 * SIRH découvrira son erreur au premier bulletin.
 *
 * VOCABULAIRE INTERDIT sur cette page :
 *   pointeuse · badgeuse · bulletin de paie · DSN · cotisation ·
 *   majoration légale · contingent annuel · repos compensateur ·
 *   API · intégration · synchronisation · connecteur ·
 *   automatiquement · en temps réel ·
 *   toute formulation laissant entendre qu'Argon calcule une paie
 *
 * LES QUATRE FRONTIÈRES, énoncées une fois chacune dans le corps :
 *   · aucun compteur de droits à congés acquis
 *   · aucun export ni fichier destiné à la paie — c'est un écran
 *   · affiche et cumule les dépassements, ne les limite ni ne les majore
 *   · ne gère pas la facture de l'agence d'intérim, donne de quoi la contrôler
 *
 * Server Component, zéro JavaScript client.
 */

const PATH = "/solutions/heures-et-absences";

export const metadata = metadataFor(PATH);

const faq: QuestionFaq[] = [
  {
    question: "Argon calcule-t-il un solde de congés payés ?",
    answer:
      "Non. Argon enregistre les demandes, les approbations et les absences posées, et il en tire les conséquences sur le planning et sur la grille des heures. Il ne tient pas de compteur de droits acquis : c'est le rôle de votre gestion sociale.",
  },
  {
    question: "Argon produit-il un bulletin de paie ?",
    answer:
      "Non, et il ne calcule aucune majoration légale. Il vous donne les heures relevées, le solde par rapport au forfait contractuel et le reliquat cumulé — c'est-à-dire ce qu'il faut pour arbitrer avant la paie, pas pour la faire.",
  },
  {
    question: "Le technicien peut-il demander un congé depuis le bureau ?",
    answer:
      "Non. La demande part de l'application mobile, et seulement de là. Le bureau accorde, refuse ou annule. Cette asymétrie est délibérée : elle garantit que la demande vient bien de la personne concernée.",
  },
  {
    question: "Peut-on saisir des heures et une absence le même jour ?",
    answer:
      "Oui. Les heures et le motif sont indépendants : une journée peut valoir quatre heures travaillées et un arrêt de travail. C'est une décision de conception, parce que la réalité du terrain est souvent celle-là.",
  },
  {
    question: "Peut-on poser un motif sur toute une période ?",
    answer:
      "Oui, jusqu'à 366 jours d'un coup, week-ends et jours fériés écartés sauf demande contraire. L'affectation groupée n'écrase jamais des heures déjà déclarées, et le retrait groupé saute les journées validées.",
  },
  {
    question: "Les heures des intérimaires sont-elles mélangées aux autres ?",
    answer:
      "Non, jamais. Deux tableaux séparés. Les heures d'un intérimaire se relèvent pour contrôler la facture de son agence ; elles n'ont rien à faire dans le total qui alimente votre paie.",
  },
  {
    question: "Peut-on corriger un compteur d'heures ?",
    answer:
      "Oui, avec un écart signé, un commentaire obligatoire et l'auteur enregistré. Rien n'empêche la correction — on l'oblige seulement à être motivée, pour qu'elle reste justifiable six mois plus tard.",
  },
];

export default function HeuresEtAbsencesPage() {
  return (
    <>
      <SolutionHero
        path={PATH}
        eyebrow="Heures et absences"
        chapo="Le temps de vos équipes se compte là où le travail se planifie. Pas dans un fichier à côté, pas le vendredi soir."
        accentue="Le planning et les heures suivent."
      />

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — LE CŒUR DE LA PAGE
          ══════════════════════════════════════════════════════ */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          eyebrow="Le congé accordé"
          title="Un congé accordé se voit dans le planning avant d'être un problème."
          description="Le technicien fait sa demande depuis son application, et seulement depuis là. Le bureau accorde, refuse ou annule, avec un commentaire de réponse ; le technicien est prévenu dans les trois cas."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">
                À l&apos;approbation, deux choses s&apos;écrivent au même instant
              </strong>{" "}
              : le technicien devient non planifiable, et le motif apparaît sur
              sa grille d&apos;heures. Une annulation défait exactement les deux.
            </p>

            <dl className="grid gap-5 border-t border-line-soft pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-ink">
                  Ce qui se demande
                </dt>
                <dd className="mt-1 text-sm text-ink-soft">
                  Congé payé et congé sans solde, en journées ou en
                  demi-journées de début et de fin de plage. Les jours fériés
                  sortent du décompte.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-ink">
                  Ce que le bureau peut poser
                </dt>
                <dd className="mt-1 text-sm text-ink-soft">
                  Neuf motifs d&apos;absence — arrêt de travail, absence, congé payé,
                  maladie, récupération, repos, formation, événement
                  exceptionnel, congé sans solde.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-ink">
                  Ce qui reste écrit
                </dt>
                <dd className="mt-1 text-sm text-ink-soft">
                  Chaque décision est horodatée et nominative. Qui a accordé
                  quoi, et quand, se retrouve des mois plus tard.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-ink">
                  Ce qu&apos;Argon ne fait pas
                </dt>
                <dd className="mt-1 text-sm text-ink-soft">
                  Il ne tient pas de compteur de droits acquis. Il enregistre ce
                  qui est posé, il ne décompte pas un solde.
                </dd>
              </div>
            </dl>

            <p className="rounded-xl border-l-4 border-line bg-surface-alt p-5 text-base leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Ce que ça évite :</span>{" "}
              affecter une mission à quelqu&apos;un qui ne sera pas là, et s&apos;en
              apercevoir la veille.
            </p>
          </div>

          <div className="space-y-5">
            <GrilleHeuresPanel />

            <p className="rounded-xl border-l-4 border-accent bg-surface p-5 text-base leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">
                Personne n&apos;a rien recopié.
              </strong>{" "}
              Le planning ne peut pas contredire les absences, et les absences
              ne peuvent pas contredire les heures : c&apos;est la même information,
              lue à trois endroits.
            </p>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — LA SAISIE
          ══════════════════════════════════════════════════════ */}
      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          eyebrow="La saisie"
          title="Les heures se comptent là où le travail se planifie."
          description="Deux portes d'entrée, une seule donnée : la grille du bureau — technicien par jour du mois — et l'application du technicien écrivent au même endroit."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-ink-soft">
              Une journée porte ses heures, son motif, un commentaire, l&apos;heure
              de début et de fin, la pause, le kilométrage relevé au compteur et
              le véhicule utilisé.
            </p>

            <p className="text-base leading-relaxed text-ink-soft">
              Les heures et le motif sont{" "}
              <strong className="font-semibold text-ink">indépendants</strong> :
              un jour peut valoir quatre heures travaillées et un arrêt de
              travail. C&apos;est la réalité du terrain, et le produit la reconnaît
              au lieu de la forcer.
            </p>

            <div className="rounded-xl border border-line-soft bg-surface p-6">
              <h3 className="text-sm font-semibold text-ink">
                Ce que la saisie refuse
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>· Moins de zéro ou plus de vingt-quatre heures dans une journée.</li>
                <li>· Une pause de moins de trente minutes.</li>
                <li>· Un compteur kilométrique inférieur au dernier relevé connu.</li>
                <li>· Un écart de plus de mille kilomètres sur une journée.</li>
              </ul>
              <p className="mt-4 border-t border-line-soft pt-4 text-sm text-ink-soft">
                Ce ne sont pas des règles de gestion : ce sont des garde-fous de
                saisie. Ils empêchent la faute de frappe, pas la décision.
              </p>
            </div>

            <p className="text-base leading-relaxed text-ink-soft">
              Un motif se pose sur toute une période, jusqu&apos;à trois cent
              soixante-six jours, week-ends et jours fériés écartés sauf demande
              contraire —{" "}
              <strong className="font-semibold text-ink">
                sans jamais écraser des heures déjà déclarées
              </strong>
              . Le retrait groupé, lui, saute les journées validées : elles sont
              passées en paie, les défaire d&apos;un clic serait le pire effet de
              bord possible pour cet écran.
            </p>

            <p className="rounded-xl border-l-4 border-line bg-surface p-5 text-base leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Ce que ça évite :</span>{" "}
              le tableur du vendredi soir, recopié depuis les carnets.
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-line-soft bg-surface p-6">
              <h3 className="text-base font-semibold text-ink">
                La preuve : Argon signale ce qui ne colle pas
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-ink-soft">
                <li>
                  Des heures saisies un jour sans aucune course — ou une course
                  sans heures.
                </li>
                <li>Un rapport kilomètres sur heures hors du raisonnable.</li>
                <li>
                  Des journées non confirmées, relancées côté mobile jusqu&apos;à
                  soixante jours en arrière.
                </li>
              </ul>
              <p className="mt-5 border-t border-line-soft pt-4 text-sm leading-relaxed text-ink-soft">
                Ces alertes ne bloquent rien. Elles vous montrent où regarder —
                et c&apos;est précisément parce que les heures et les courses sont la
                même information qu&apos;Argon peut voir qu&apos;elles se contredisent.
              </p>
            </div>

            <p className="rounded-xl bg-surface-alt p-5 text-sm leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">La frontière :</strong>{" "}
              le récapitulatif est un écran, pas un fichier de paie. Argon ne
              produit ni bulletin, ni déclaration, ni export destiné à un
              logiciel de paie.
            </p>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — LE DÉPASSEMENT
          ══════════════════════════════════════════════════════ */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          eyebrow="Le dépassement"
          title="Le dépassement vous prévient. Il ne se découvre pas à la paie."
          description="Le récapitulatif mensuel confronte les heures relevées au forfait contractuel du salarié. Le solde du mois en découle, et le reliquat cumulé additionne tous les mois depuis l'origine."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-ink-soft">
              Ce reliquat n&apos;est jamais stocké : il est recalculé à chaque
              affichage. Il n&apos;existe donc pas de chiffre figé quelque part qui
              pourrait diverger de la réalité des saisies.
            </p>

            <div className="rounded-xl border border-line-soft bg-surface p-6">
              <h3 className="text-sm font-semibold text-ink">
                Ce que le récapitulatif met côte à côte
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Jours travaillés · jours d&apos;absence, détaillés par motif · total
                d&apos;heures · solde · heures au-delà du forfait · reliquat ·
                courses · kilomètres · alertes · commentaires.
              </p>
              <p className="mt-4 border-t border-line-soft pt-4 text-sm text-ink-soft">
                Le technicien consulte son propre récapitulatif depuis son
                application : son forfait, son solde, son reliquat. Ce n&apos;est pas
                une information qu&apos;on lui cache.
              </p>
            </div>

            <p className="rounded-xl border-l-4 border-line bg-surface-alt p-5 text-base leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Ce que ça évite :</span>{" "}
              découvrir les heures supplémentaires au moment de la paie, quand
              il n&apos;y a plus rien à arbitrer.
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-line-soft bg-surface p-6">
              <h3 className="text-base font-semibold text-ink">
                La preuve : une correction laisse une trace signée
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Solder des heures supplémentaires payées, c&apos;est ajuster un
                compteur. Argon l&apos;autorise, et exige trois choses en échange :
                un écart signé, un commentaire obligatoire — « heures
                supplémentaires payées en juillet » — et l&apos;auteur de la
                correction, enregistré.
              </p>
              <p className="mt-5 border-t border-line-soft pt-4 text-sm leading-relaxed text-ink-soft">
                Ce n&apos;est pas un contrôle : rien n&apos;empêche l&apos;ajustement. On
                l&apos;oblige seulement à être motivé, pour qu&apos;il reste justifiable
                six mois plus tard. C&apos;est la même logique que l&apos;horodatage du
                transfert comptable — Argon garde la trace de ce qui a été
                décidé.
              </p>
            </div>

            <p className="rounded-xl bg-surface-alt p-5 text-sm leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">La frontière :</strong>{" "}
              Argon affiche et cumule les heures au-delà du forfait. Il ne les
              limite pas, ne calcule aucune majoration légale, et ne connaît ni
              contingent annuel, ni repos compensateur.
            </p>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — L'INTÉRIM
          ══════════════════════════════════════════════════════ */}
      <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          eyebrow="Salariés et intérim"
          title="Les heures d'un intérimaire ne se mélangent pas à celles de vos salariés."
          description="Deux tableaux séparés, dans les deux écrans d'heures. D'un côté vos salariés, de l'autre l'intérim et la sous-traitance."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-ink-soft">
              Le produit distingue les trois statuts et sait qu&apos;un intervenant
              extérieur n&apos;est pas rémunéré par vous : ni heures de contrat, ni
              paie.
            </p>

            <p className="text-base leading-relaxed text-ink-soft">
              Les heures d&apos;un intérimaire se relèvent quand même — elles servent
              à{" "}
              <strong className="font-semibold text-ink">
                contrôler la facture de son agence
              </strong>
              . Mais elles n&apos;ont rien à faire dans le total qui alimente votre
              paie, et Argon ne les y met pas.
            </p>

            <p className="rounded-xl border-l-4 border-line bg-surface p-5 text-base leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Ce que ça évite :</span>{" "}
              un compteur qui gonfle sans qu&apos;on sache ce qu&apos;on paie et ce qu&apos;on
              refacture.
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-line-soft bg-surface p-6">
              <h3 className="text-base font-semibold text-ink">
                La preuve : la séparation n&apos;est pas un filtre
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Ce ne sont pas deux vues d&apos;une même liste qu&apos;on pourrait
                confondre en enlevant un filtre. Ce sont deux tableaux, sur les
                deux écrans, en permanence. Le total de l&apos;un ne peut pas
                contenir l&apos;autre.
              </p>
              <p className="mt-4 border-t border-line-soft pt-4 text-sm leading-relaxed text-ink-soft">
                Personne n&apos;invente cette distinction sans avoir vu le problème.
              </p>
            </div>

            <p className="rounded-xl bg-surface-alt p-5 text-sm leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">La frontière :</strong>{" "}
              Argon ne gère pas la facture de l&apos;agence d&apos;intérim. Il vous donne
              de quoi la contrôler.
            </p>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — LE DOSSIER
          ══════════════════════════════════════════════════════ */}
      <Section containerWidth="wide" className="border-b border-line-soft">
        <SectionHeading
          eyebrow="Le dossier du salarié"
          title="Ce qui a une date d'expiration ne devrait pas vivre dans un classeur."
          description="Le dossier porte son matricule — pérenne, attribué une fois —, son état civil, ses coordonnées, son permis, sa date d'entrée, son forfait mensuel d'heures, son amplitude, sa succursale, sa photo et sa signature."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-ink-soft">
              Les documents s&apos;y joignent — PDF et images —, avec l&apos;auteur du
              dépôt et sa date. Et à côté d&apos;eux, le suivi de ce qui expire :{" "}
              <strong className="font-semibold text-ink">
                visite médicale, formation, renouvellement de permis
              </strong>
              , chacun avec sa durée de validité.
            </p>

            <p className="text-base leading-relaxed text-ink-soft">
              La prochaine échéance n&apos;est pas stockée : elle se recalcule à
              chaque affichage, à partir de la dernière date et de la durée. Une
              date de validité corrigée corrige l&apos;échéance dans la foulée, sans
              que rien n&apos;ait à être remis à jour.
            </p>

            <p className="rounded-xl border-l-4 border-line bg-surface-alt p-5 text-base leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Ce que ça évite :</span>{" "}
              découvrir qu&apos;une visite médicale a expiré le jour où quelqu&apos;un
              vous le demande.
            </p>
          </div>

          <div className="rounded-2xl border border-line-soft bg-surface p-6">
            <h3 className="text-base font-semibold text-ink">
              La preuve : l&apos;échéance vit au même endroit que les heures
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              C&apos;est le même dossier. Le forfait qui sert au calcul du solde, le
              permis qui conditionne l&apos;affectation et la visite médicale qui
              arrive à échéance ne sont pas trois fichiers dans trois classeurs :
              ce sont trois lignes de la même fiche.
            </p>
            <p className="mt-4 border-t border-line-soft pt-4 text-sm leading-relaxed text-ink-soft">
              C&apos;est encore le même principe : une information saisie une fois,
              lue partout où elle compte.
            </p>
          </div>
        </div>
      </Section>

      <SolutionFaq items={faq} />

      <RelatedPages
        titre="La suite du parcours"
        paths={[
          "/solutions/planning-interventions",
          "/solutions/application-mobile-technicien",
          "/solutions/gestion-interventions",
        ]}
      />

      <SolutionCta
        titre="Reprenons un de vos mois, tel qu'il s'est passé."
        texte="Vos absences, vos heures, vos dépassements. Nous vous montrons ce qu'Argon en aurait fait — et ce qu'il n'aurait pas fait."
      />

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
