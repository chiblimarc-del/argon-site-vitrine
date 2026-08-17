import { Section, SectionHeading } from "@/components/ui/Section";
import { NavLink } from "@/components/navigation/NavLink";
import { ArrowRight } from "@/components/ui/Button";
import { findRoute } from "@/lib/routes";

/**
 * SECTION 5 — LES MÉTIERS.
 *
 * Rôle : orienter vers les futures pages métiers. Ce n'est PAS une section de
 * positionnement SEO — on ne cherche pas à viser cinq requêtes depuis
 * l'accueil, chaque page métier portera la sienne. Aucun mot-clé, aucune
 * route, aucune modification du registre.
 *
 * Parti pris : ne pas aligner cinq cartes de structure identique où seul le
 * nom change. Chaque métier a un rythme de travail différent, et c'est ce
 * rythme qui structure sa carte :
 *   - Maintenance   → la récurrence (les mêmes sites reviennent)
 *   - Transport     → l'enchaînement (une suite de points dans la journée)
 *   - Dépannage     → la réaction (l'appel arrive, il faut partir)
 *   - Installation  → les phases (préparer, poser, réceptionner)
 *   - CVC           → la saisonnalité (deux régimes dans l'année)
 *
 * Chaque carte porte un micro-motif SVG propre à ce rythme, une accroche
 * écrite dans le vocabulaire du métier, et sa propre liste de termes. Les
 * tailles de cartes sont volontairement inégales : maintenance et transport
 * sont les deux portes prioritaires.
 *
 * « Intervention terrain » n'apparaît pas : ce n'est pas un métier, c'est le
 * socle commun aux cinq.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ (cahier V2 §31)
 * Le vocabulaire des cartes décrit le quotidien du métier, jamais des
 * fonctionnalités Argon. Les seules capacités évoquées sont validées :
 * fiches client et site, planning et affectation, application mobile, photos,
 * signature, comptes rendus.
 *
 * INTERDIT : IA, géolocalisation avancée, optimisation de tournées, gestion
 * de stocks, RH, BI, comptabilité, ERP. Ne pas revendiquer non plus la
 * gestion des contrats d'entretien ni celle des équipements : non validées.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Metier = {
  /** Chemin de la future page métier, tel que déclaré au registre. */
  path: string;
  /** Titre éditorial de la carte (peut différer du libellé de navigation). */
  titre: string;
  /** Le rythme de travail propre au métier, en une formule. */
  rythme: string;
  accroche: string;
  /** Termes du métier, pas des fonctionnalités Argon. */
  vocabulaire: string[];
  motif: React.ReactNode;
  /** Emprise en grand écran, sur une grille de 6 colonnes. */
  emprise: string;
  accent: string;
};

const metiers: Metier[] = [
  {
    path: "/secteurs/maintenance",
    titre: "Maintenance",
    rythme: "La récurrence",
    accroche:
      "Les mêmes sites reviennent, à intervalles réguliers. Chaque passage s'ajoute à l'historique du site, et le planning montre qui doit y retourner.",
    vocabulaire: ["Sites", "Visites régulières", "Techniciens", "Comptes rendus"],
    motif: <MotifRecurrence />,
    emprise: "lg:col-span-3",
    accent: "text-cyan",
  },
  {
    path: "/secteurs/transport-courses",
    titre: "Transport & courses",
    rythme: "L'enchaînement",
    accroche:
      "Une journée, c'est une suite de points à enchaîner. Chaque course porte son donneur d'ordre, son conducteur et son créneau, et se clôt sur une preuve de réalisation.",
    vocabulaire: ["Courses", "Conducteurs", "Créneaux", "Preuve de livraison"],
    motif: <MotifEnchainement />,
    emprise: "lg:col-span-3",
    accent: "text-accent2-text",
  },
  {
    path: "/secteurs/depannage",
    titre: "Dépannage",
    rythme: "La réaction",
    accroche:
      "L'appel arrive, il faut savoir qui est disponible tout de suite. L'intervention est créée, affectée et suivie jusqu'à sa clôture, sans repasser par le téléphone.",
    vocabulaire: ["Urgence", "Disponibilité", "Affectation", "Clôture"],
    motif: <MotifReaction />,
    emprise: "lg:col-span-2",
    accent: "text-warn",
  },
  {
    path: "/secteurs/installation",
    titre: "Installation",
    rythme: "Les phases",
    accroche:
      "Une pose se prépare, s'exécute, puis se réceptionne. Les photos et la signature du client font foi de la mise en service.",
    vocabulaire: ["Préparation", "Pose", "Photos", "Réception"],
    motif: <MotifPhases />,
    emprise: "lg:col-span-2",
    accent: "text-accent-mid",
  },
  {
    path: "/secteurs/cvc",
    titre: "CVC — climatisation & chauffage",
    rythme: "La saisonnalité",
    accroche:
      "Deux saisons, deux régimes : l'entretien quand c'est calme, le dépannage quand tout tombe en panne en même temps. Le même outil absorbe les deux.",
    vocabulaire: ["Entretien", "Dépannage", "Saison haute", "Comptes rendus"],
    motif: <MotifSaisons />,
    emprise: "lg:col-span-2",
    accent: "text-accent-text",
  },
];

export function SectorsSection() {
  return (
    <Section containerWidth="wide" className="border-b border-line-soft">
      <SectionHeading
        eyebrow="Cinq métiers, un socle commun"
        title={
          <>
            Un logiciel pensé pour les entreprises qui{" "}
            <span className="text-gradient">travaillent sur le terrain</span>.
          </>
        }
        description="Maintenance, dépannage, installation, transport ou CVC : chaque activité a ses contraintes. Argon organise le même cycle de gestion autour des réalités de votre métier."
        className="max-w-3xl"
      />

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {metiers.map((metier) => (
          <li key={metier.path} className={metier.emprise}>
            <CarteMetier metier={metier} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function CarteMetier({ metier }: { metier: Metier }) {
  const route = findRoute(metier.path);
  const disponible = route?.published ?? false;

  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`text-[11px] font-medium uppercase tracking-[0.12em] ${metier.accent}`}
          >
            {metier.rythme}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-tight text-ink">
            {metier.titre}
          </h3>
        </div>

        {/* Micro-motif propre au rythme du métier. */}
        <span
          aria-hidden="true"
          className={`shrink-0 ${metier.accent} opacity-70`}
        >
          {metier.motif}
        </span>
      </div>

      <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
        {metier.accroche}
      </p>

      {/* Vocabulaire du métier — ce que le visiteur reconnaît de son quotidien,
          et non une liste de fonctionnalités Argon. */}
      <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
        {metier.vocabulaire.map((terme) => (
          <li
            key={terme}
            className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] text-ink-muted"
          >
            {terme}
          </li>
        ))}
      </ul>

      {/*
        Orientation vers la future page métier. Tant que la route n'est pas
        publiée dans le registre, on affiche une mention explicite plutôt qu'un
        lien mort — cohérent avec le comportement du header et du footer.
      */}
      <div className="mt-auto pt-6">
        {disponible ? (
          <NavLink
            href={metier.path}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent-text"
          >
            Argon pour ce métier
            <ArrowRight />
          </NavLink>
        ) : (
          <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-ink-muted"
            />
            Page métier en préparation
          </span>
        )}
      </div>
    </article>
  );
}

/* ==========================================================================
   MICRO-MOTIFS
   Un tracé par rythme de travail. SVG inline, quelques dizaines d'octets,
   aucune image (cahier V2 §29).
   ========================================================================== */

const trait = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Maintenance — des passages réguliers, puis on recommence. */
function MotifRecurrence() {
  return (
    <svg viewBox="0 0 56 28" className="h-7 w-14">
      {/* Les passages, espacés régulièrement. */}
      <circle cx="7" cy="8" r="2.2" fill="currentColor" />
      <circle cx="21" cy="8" r="2.2" fill="currentColor" />
      <circle cx="35" cy="8" r="2.2" fill="currentColor" />
      <circle cx="49" cy="8" r="2.2" fill="currentColor" />
      {/* La boucle qui ramène au début du cycle. */}
      <path d="M49 13c0 8-42 8-42 0" {...trait} />
      <path d="m4 10.5 3 3 3-3" {...trait} />
    </svg>
  );
}

/** Transport — une suite de points à enchaîner. */
function MotifEnchainement() {
  return (
    <svg viewBox="0 0 56 28" className="h-7 w-14">
      <path d="M4 20 16 10l12 8 12-12 12 6" {...trait} />
      <circle cx="4" cy="20" r="2" fill="currentColor" />
      <circle cx="16" cy="10" r="2" fill="currentColor" />
      <circle cx="28" cy="18" r="2" fill="currentColor" />
      <circle cx="40" cy="6" r="2" fill="currentColor" />
      <circle cx="52" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}

/** Dépannage — une réaction immédiate, puis le retour au calme. */
function MotifReaction() {
  return (
    <svg viewBox="0 0 56 28" className="h-7 w-14">
      <path d="M2 22h12l5-16 6 22 5-14 4 8h20" {...trait} />
    </svg>
  );
}

/** Installation — trois phases qui s'enchaînent. */
function MotifPhases() {
  return (
    <svg viewBox="0 0 56 28" className="h-7 w-14">
      <rect x="2" y="6" width="14" height="5" rx="2.5" fill="currentColor" />
      <rect x="2" y="15" width="26" height="5" rx="2.5" fill="currentColor" opacity="0.7" />
      <rect x="2" y="24" width="42" height="4" rx="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

/** CVC — deux régimes qui alternent dans l'année. */
function MotifSaisons() {
  return (
    <svg viewBox="0 0 56 28" className="h-7 w-14">
      <path d="M2 14c6-12 12-12 18 0s12 12 18 0 12-12 16-6" {...trait} />
    </svg>
  );
}
