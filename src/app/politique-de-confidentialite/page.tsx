import { JsonLd } from "@/components/seo/JsonLd";
import {
  LegalHero,
  LegalCorps,
  LegalBloc,
  LegalIdentite,
} from "@/components/sections/legal/LegalLayout";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * POLITIQUE DE CONFIDENTIALITÉ.
 *
 * ⚠️ RÈGLE DE RÉDACTION : cette page décrit ce que le site fait RÉELLEMENT,
 * jamais ce qu'un site de ce type fait d'habitude. Chaque affirmation ci-dessous
 * a été vérifiée sur la production le 18/08/2026 :
 *   — aucun cookie, aucun localStorage, aucun sessionStorage, aucune base
 *     IndexedDB, aucun service worker ;
 *   — un seul formulaire, cinq champs, transmis par Mailjet.
 *
 * ⚠️ MISE À JOUR DU 18/08/2026, PLUS TARD DANS LA JOURNÉE
 * La ligne « aucune requête vers un domaine tiers » n'est plus vraie : le
 * formulaire porte désormais Turnstile, et le navigateur contacte donc
 * challenges.cloudflare.com. Le reste de la vérification tient, y compris
 * l'absence de cookie — Turnstile n'en pose aucun tant que le mode
 * « pre-clearance » reste désactivé, ce qui est son état par défaut.
 *
 * MÉCANISME DE TRANSFERT — VÉRIFIÉ LE 18/08/2026
 * Source : l'addendum de traitement des données publié par Cloudflare
 * (cloudflare.com/cloudflare-customer-dpa/), qui énonce deux fondements
 * cumulés — les clauses contractuelles types de la Commission européenne,
 * module 2 lorsque le client est responsable de traitement, et l'adhésion de
 * Cloudflare au Data Privacy Framework UE–États-Unis. La partie contractante
 * est Cloudflare, Inc.
 *
 * ⚠️ Une adhésion au Data Privacy Framework se vérifie, et peut être retirée.
 * Si ce cadre venait à être invalidé — les deux précédents, Safe Harbor puis
 * Privacy Shield, l'ont été — les clauses contractuelles types subsisteraient,
 * mais cette page devrait être relue.
 *
 * Une politique qui promet moins que la réalité est un mensonge ; une politique
 * qui promet plus est une faute. Si un traceur, une mesure d'audience ou un
 * champ supplémentaire apparaît un jour, CETTE PAGE se met à jour dans le même
 * commit — pas plus tard.
 *
 * BASE LÉGALE — ARBITRÉE LE 18/08/2026
 *
 * L'article 13.1.c du RGPD impose d'indiquer la base juridique du traitement.
 * Deux qualifications étaient plausibles ; le choix s'est porté sur l'article
 * 6.1.b, mesures précontractuelles prises à la demande de la personne.
 *
 * Le motif : c'est le prospect lui-même qui sollicite une démonstration, et
 * les cinq données servent exclusivement à le recontacter, préparer la
 * présentation et suivre l'échange. L'intérêt légitime (art. 6.1.f), l'autre
 * candidat, décrit une prospection que nous n'engageons pas — nous ne
 * constituons aucun fichier à partir d'autres sources.
 *
 * Le sujet est donc clos : ne pas le rouvrir sans un motif nouveau, et si la
 * qualification devait changer, corriger la page ET ce commentaire ensemble.
 */

const PATH = "/politique-de-confidentialite";

export const metadata = metadataFor(PATH);

const MISE_A_JOUR = "Dernière mise à jour : 18 août 2026.";

const responsable = [
  { terme: "Responsable du traitement", valeur: "Vertus Consulting" },
  { terme: "Siège social", valeur: "76 rue Arago, 33300 Bordeaux, France" },
  { terme: "Immatriculation", valeur: "RCS Bordeaux 913 663 571" },
  { terme: "Contact pour vos droits", valeur: "info@argon-mobility.com" },
];

const collecte = [
  "Un seul formulaire du site collecte des données : la demande de démonstration. Il comporte cinq champs, tous nécessaires pour vous rappeler et préparer l'échange — votre nom, le nom de votre entreprise, votre adresse électronique, votre numéro de téléphone et votre secteur d'activité.",
  "Aucun autre champ n'est demandé, aucun champ n'est facultatif, et rien n'est collecté à votre insu. Le site ne propose ni compte, ni newsletter, ni espace client.",
];

const technique = [
  "Comme tout serveur web, celui qui sert ce site enregistre les requêtes qu'il reçoit : adresse IP, date et heure, page demandée, navigateur utilisé. Ces journaux servent au diagnostic technique et à la sécurité, jamais à la prospection, et ne sont jamais recoupés avec les demandes reçues par le formulaire.",
  "Ils ne sont pas conservés pour une durée fixe mais bornés en volume : au plus trois fichiers de dix mégaoctets, les entrées les plus anciennes étant écrasées à mesure que de nouvelles arrivent. Leur profondeur d'historique dépend donc du trafic, et reste de l'ordre de quelques semaines.",
  "Le formulaire mesure par ailleurs la durée de sa saisie et comporte un champ invisible destiné aux robots. Ces deux mesures servent uniquement à écarter les soumissions automatisées ; elles ne sont pas conservées.",
  "Pour empêcher qu'un automate ne sature le formulaire, le nombre d'envois est borné. Le serveur conserve à cette seule fin une empreinte chiffrée de votre adresse IP, effacée au bout de vingt-quatre heures : l'adresse elle-même n'est pas enregistrée, et l'empreinte ne permet pas de la reconstituer.",
  "Le domaine de l'adresse électronique que vous indiquez fait l'objet d'une vérification technique — nous demandons au réseau si ce domaine reçoit du courrier. Aucun message ne vous est envoyé à cette occasion, et un domaine non vérifiable n'empêche jamais votre demande d'aboutir.",
  "La page de demande de démonstration porte enfin un contrôle anti-robot fourni par Cloudflare. Il examine votre adresse IP et quelques caractéristiques techniques de votre navigateur pour établir que vous êtes bien une personne. Il ne dépose aucun cookie et ne conserve rien chez nous.",
];

const finalite = [
  "Vos données servent à répondre à votre demande de démonstration : vous recontacter, préparer la présentation et assurer le suivi de l'échange. Elles ne servent à rien d'autre.",
  "Le traitement repose entièrement sur la démarche que vous engagez : sans votre demande, aucune de ces données ne serait collectée. Sa base légale est l'exécution de mesures précontractuelles prises à votre demande, au sens de l'article 6.1.b du RGPD. Nous ne constituons aucun fichier de prospection à partir d'autres sources.",
  "Vos données ne sont ni vendues, ni louées, ni cédées, ni utilisées à des fins publicitaires.",
];

const duree = [
  "Les demandes de démonstration sont conservées trois ans à compter de notre dernier contact. Passé ce délai, elles sont supprimées.",
  "Vous pouvez demander leur suppression à tout moment avant ce terme, sans avoir à vous justifier.",
];

const destinataires = [
  "Vos données sont traitées par Vertus Consulting. Trois prestataires interviennent techniquement dans la chaîne, chacun pour la seule opération qui le concerne :",
];

const sousTraitants = [
  {
    terme: "OVH SAS",
    valeur: "Hébergement du site, sur une infrastructure située en France.",
  },
  {
    terme: "Mailjet (groupe Sinch)",
    valeur:
      "Acheminement du message issu du formulaire jusqu'à notre boîte de réception.",
  },
  {
    terme: "Cloudflare",
    valeur:
      "Contrôle anti-robot du formulaire. Reçoit votre adresse IP et quelques caractéristiques techniques de votre navigateur, à seule fin de distinguer un visiteur d'un automate.",
  },
];

const transferts = [
  "L'hébergement et l'acheminement des messages se font sur des infrastructures situées dans l'Union européenne.",
  "Le contrôle anti-robot fait exception : Cloudflare, Inc. est une société américaine, et le traitement de votre adresse IP à cette occasion implique un transfert hors de l'Union européenne. Ce transfert repose sur deux fondements cumulés, que Cloudflare énonce dans son addendum de traitement des données : les clauses contractuelles types adoptées par la Commission européenne, et son adhésion au Data Privacy Framework entre l'Union européenne et les États-Unis.",
  "Ce traitement se limite à la page de demande de démonstration, et les données correspondantes ne nous sont jamais transmises : nous ne recevons que le verdict, humain ou automate.",
];

const cookies = [
  "Ce site ne dépose aucun cookie, et n'écrit rien dans la mémoire de votre navigateur. Il n'utilise ni mesure d'audience, ni pixel publicitaire, ni bouton de réseau social, ni police de caractères chargée depuis un serveur tiers.",
  "C'est pour cette raison qu'aucune bannière de consentement ne vous est présentée : il n'y a rien à consentir, puisque rien n'est déposé.",
  "Une seule exception à l'absence de tiers, et elle est limitée à la page de demande de démonstration : le contrôle anti-robot y fait appel à Cloudflare. Votre navigateur contacte alors challenges.cloudflare.com, qui reçoit votre adresse IP et quelques caractéristiques techniques. Ce contrôle ne dépose aucun cookie et ne sert qu'à distinguer un visiteur d'un automate — il ne permet ni de vous identifier, ni de vous suivre d'un site à l'autre. Aucune autre page du site n'émet la moindre requête vers un autre domaine.",
];

const droits = [
  "Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données, ainsi que d'un droit à la limitation et à l'opposition au traitement.",
  "Pour les exercer, écrivez à info@argon-mobility.com. Nous répondons dans un délai d'un mois. Aucune pièce d'identité ne vous sera demandée si votre demande provient de l'adresse électronique que vous nous aviez communiquée.",
  "Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — ou sur cnil.fr.",
];

const securite = [
  "Le site est servi exclusivement en HTTPS. Les identifiants nécessaires à l'envoi des messages sont stockés hors de la racine web du serveur, dans un fichier qu'aucune URL ne peut atteindre, et ne figurent dans aucun dépôt de code.",
  "Aucun système n'est infaillible : si une violation de données vous concernant devait survenir et présenter un risque pour vos droits, vous en seriez informé conformément à l'article 34 du RGPD.",
];

const modifications = [
  "Cette politique peut évoluer si les traitements changent. La date de dernière mise à jour figure en haut de cette page ; toute modification de fond y sera reflétée au moment où elle prend effet, et non après.",
];

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <LegalHero
        path={PATH}
        chapo="Ce site collecte très peu de données, et cette page dit exactement lesquelles, pourquoi, pendant combien de temps, et comment les faire supprimer."
        miseAJour={MISE_A_JOUR}
      />

      <LegalCorps>
        <LegalBloc numero="01" titre="Qui traite vos données">
          <LegalIdentite entrees={responsable} />
        </LegalBloc>

        <LegalBloc numero="02" titre="Ce que nous collectons">
          {collecte.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="03" titre="Données techniques">
          {technique.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="04" titre="Pourquoi, et sur quelle base">
          {finalite.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="05" titre="Combien de temps">
          {duree.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="06" titre="Qui y a accès">
          {destinataires.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
          <LegalIdentite entrees={sousTraitants} />
          {transferts.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="07" titre="Cookies et traceurs : aucun">
          {cookies.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="08" titre="Vos droits">
          {droits.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="09" titre="Sécurité">
          {securite.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>

        <LegalBloc numero="10" titre="Modifications">
          {modifications.map((texte) => (
            <p key={texte}>{texte}</p>
          ))}
        </LegalBloc>
      </LegalCorps>

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
