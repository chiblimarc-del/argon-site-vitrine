import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * SECTION 2 — LE PROBLÈME OPÉRATIONNEL (cahier V2 §7, section 2).
 *
 * Objectif : la reconnaissance immédiate. Le visiteur doit se dire « c'est
 * exactement ma semaine », pas lire une liste de douleurs SaaS interchangeables.
 *
 * Parti pris : ne PAS écrire « informations dispersées » puis passer au point
 * suivant. On montre les artefacts réels dans lesquels l'information se
 * disperse — un SMS, un tableur en version 4, un devis sans réponse, un appel
 * manqué, une relance par e-mail, une note de carnet, un compte rendu papier,
 * des interventions non facturées. Chaque carte porte ensuite, en clair, le
 * problème qu'elle illustre.
 *
 * Les huit artefacts couvrent les trois domaines de la chaîne de gestion
 * présentée en section 3 : commercial, exploitation, administration. La
 * dispersion n'est pas seulement opérationnelle, elle traverse toute
 * l'entreprise — c'est ce qui rend la section 3 nécessaire.
 *
 * Dialogue visuel avec le Hero : le panneau Argon y est parfaitement aligné,
 * une seule surface, une seule grille. Ici, mêmes composants et mêmes jetons
 * de couleur, mais huit surfaces autonomes, légèrement désalignées, reliées par
 * des traits qui ne se rejoignent pas. La composition dit la dispersion avant
 * que le texte ne la nomme.
 *
 * Règle de vérité (V2 §31) : aucune statistique, aucun pourcentage, aucun coût
 * chiffré. Les contenus des cartes — horodatages, numéro de devis, nombre
 * d'interventions — sont des données d'illustration décrivant une situation
 * quelconque, jamais une mesure réalisée par Argon ni une moyenne constatée
 * chez ses utilisateurs.
 *
 * Server Component, aucune image, aucun JavaScript.
 */

type Artefact = {
  /** Canal d'où provient réellement l'information sur le terrain. */
  source: string;
  /** Horodatage d'illustration, pour ancrer la scène dans une journée. */
  repere: string;
  /** Le contenu tel qu'il arrive : brut, non structuré. */
  contenu: string;
  /** Le problème de fond que cet artefact illustre. */
  probleme: string;
  /** Inclinaison en grand écran. Volontairement faible. */
  inclinaison: string;
  ton: "neutre" | "alerte";
};

const artefacts: Artefact[] = [
  {
    source: "SMS",
    repere: "09:14",
    contenu: "« Tu es où ? Le client a rappelé, il attend toujours. »",
    probleme: "Des équipes difficiles à coordonner en temps réel",
    inclinaison: "lg:-rotate-[0.9deg]",
    ton: "alerte",
  },
  {
    source: "Tableur partagé",
    repere: "modifié il y a 8 min",
    contenu: "planning_semaine_37_v4_FINAL(2).xlsx",
    probleme: "Un planning qui change plus vite que le fichier",
    inclinaison: "lg:rotate-[0.7deg]",
    ton: "neutre",
  },
  {
    source: "Devis",
    repere: "sans réponse",
    contenu: "Devis n° 2214 — envoyé il y a 11 jours",
    probleme: "Des devis qui s'oublient faute de relance",
    inclinaison: "lg:rotate-[0.5deg]",
    ton: "neutre",
  },
  {
    source: "Appels",
    repere: "matinée",
    contenu: "Agence Sud · 3 appels manqués",
    probleme: "Le suivi qui repose sur le téléphone",
    inclinaison: "lg:-rotate-[0.5deg]",
    ton: "alerte",
  },
  {
    source: "E-mail",
    repere: "hier, 18:42",
    contenu: "RE: RE: TR: Report de l'intervention de jeudi ?",
    probleme: "Des informations dispersées entre les outils",
    inclinaison: "lg:-rotate-[0.6deg]",
    ton: "neutre",
  },
  {
    source: "Carnet du technicien",
    repere: "à ressaisir",
    contenu: "Pièce manquante sur site — prévoir un second passage",
    probleme: "Des remontées terrain qui arrivent trop tard",
    inclinaison: "lg:rotate-[0.8deg]",
    ton: "neutre",
  },
  {
    source: "Compte rendu papier",
    repere: "en attente",
    contenu: "Rapport d'intervention — récupéré en fin de semaine",
    probleme: "Un suivi administratif toujours en retard sur le terrain",
    inclinaison: "lg:-rotate-[0.4deg]",
    ton: "neutre",
  },
  {
    source: "Facturation",
    repere: "en attente",
    // « 6 » est une donnée d'illustration, au même titre que les horodatages
    // des autres cartes. Ce n'est en aucun cas une statistique mesurée par
    // Argon ni une moyenne constatée chez ses utilisateurs.
    contenu: "6 interventions réalisées · non facturées",
    probleme: "Du travail réalisé qui n'arrive jamais sur une facture",
    inclinaison: "lg:rotate-[0.6deg]",
    ton: "alerte",
  },
];

export function ProblemSection() {
  return (
    <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
      {/* Liens rompus en fond : des traits qui partent sans jamais se rejoindre. */}
      <BrokenLinks />

      <SectionHeading
        eyebrow="Le quotidien d'une exploitation"
        title={
          <>
            Quand les opérations se multiplient, la{" "}
            <span className="text-gradient">coordination</span> devient complexe.
          </>
        }
        description="L'information existe déjà : elle est dans un SMS, dans un tableur, dans un devis sans réponse, sur un carnet, dans une facture jamais établie. Le problème n'est pas de la produire, c'est qu'elle n'est jamais au même endroit au même moment."
        className="max-w-3xl"
      />

      <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {artefacts.map((artefact) => (
          <li
            key={artefact.source}
            className={`card flex flex-col p-5 transition-transform duration-300 ${artefact.inclinaison} hover:rotate-0`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  artefact.ton === "alerte" ? "bg-warn" : "bg-ink-muted"
                }`}
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">
                {artefact.source}
              </span>
              <span className="ml-auto shrink-0 text-[11px] text-ink-muted">
                {artefact.repere}
              </span>
            </div>

            <p className="mt-4 text-[15px] leading-snug text-ink">
              {artefact.contenu}
            </p>

            <p className="mt-auto pt-5 text-[13px] leading-relaxed text-ink-muted">
              {artefact.probleme}
            </p>
          </li>
        ))}
      </ul>

      {/*
        Transition vers la section 3. Formulée comme un constat, pas comme une
        promesse chiffrée : on ne vend rien ici, on ferme le diagnostic.
      */}
      <p className="mt-14 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
        Chacune de ces informations est juste. Prises séparément, elles ne
        donnent aucune vision de l&apos;activité — et personne ne sait laquelle
        est la plus à jour.
      </p>
    </Section>
  );
}

/**
 * Décor de fond : des liaisons interrompues. Purement visuel, aria-hidden.
 * Écho inversé de la tournée continue tracée sur la carte du Hero.
 */
function BrokenLinks() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-[0.5]"
      >
        <g
          className="text-line"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeDasharray="5 9"
          strokeLinecap="round"
        >
          <path d="M120 460 C260 400 300 300 470 320" />
          <path d="M640 300 C760 330 800 430 950 400" />
          <path d="M300 150 C420 190 520 120 610 170" />
          <path d="M820 120 C900 180 1010 150 1080 210" />
        </g>
        <g className="text-line-soft" fill="currentColor">
          <circle cx="120" cy="460" r="3" />
          <circle cx="470" cy="320" r="3" />
          <circle cx="640" cy="300" r="3" />
          <circle cx="950" cy="400" r="3" />
          <circle cx="300" cy="150" r="3" />
          <circle cx="610" cy="170" r="3" />
          <circle cx="820" cy="120" r="3" />
          <circle cx="1080" cy="210" r="3" />
        </g>
      </svg>
    </div>
  );
}
