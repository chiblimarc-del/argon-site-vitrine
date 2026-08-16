import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Marque Argon — le « A » triangulaire de l'identité.
 *
 * ⚠️ RECONSTRUCTION GÉOMÉTRIQUE — à remplacer par le SVG officiel.
 * Le tracé approxime le logo fourni : triangle évidé, avec une entaille
 * parallèle au flanc droit qui détache la jambe inférieure gauche.
 * Dès que le fichier vectoriel source sera disponible, il suffira de
 * remplacer le contenu de <svg> : l'API du composant ne bougera pas.
 *
 * Technique : un masque plutôt qu'un `fill-rule="evenodd"`. Avec evenodd,
 * l'entaille qui traverse à la fois la branche et l'évidement se ré-inverse
 * et fait réapparaître un coin plein parasite.
 *
 * `id` doit être unique dans la page : le header et le pied de page en
 * passent chacun un différent.
 */
export function LogoMark({
  id = "argon-mark",
  className,
}: {
  id?: string;
  className?: string;
}) {
  const maskId = `${id}-mask`;
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      // Ni hauteur ni largeur par défaut : elles sont imposées par l'appelant.
      // Un SVG sans attributs width/height retombe sinon sur la largeur des
      // éléments remplacés (300 px), ce qui faisait déborder le header.
      className={cn(className)}
    >
      <mask id={maskId}>
        {/* Triangle plein */}
        <path fill="#fff" d="M50 3 L98 96 L2 96 Z" />
        {/* Évidement central */}
        <path fill="#000" d="M50 38 L76 90 L24 90 Z" />
        {/* Entaille qui détache la jambe inférieure gauche */}
        <path fill="#000" d="M28 46 L53 96 L42 96 L22 55 Z" />
      </mask>
      <rect width="100" height="100" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

interface LogoProps {
  /** Identifiant unique dans la page (le masque SVG en dépend). */
  id?: string;
  /** Masque le nom écrit et ne garde que la marque. */
  markOnly?: boolean;
  className?: string;
}

/**
 * Logo complet cliquable, pointant vers l'accueil.
 *
 * ⛔ DÉCISION VERROUILLÉE : le logo du site n'affiche JAMAIS le baseline
 * « TRANSPORT MANAGEMENT SYSTEM » présent sur le logo d'origine. Le site
 * positionne Argon sur les opérations terrain à travers cinq métiers
 * (maintenance, dépannage, installation, transport léger, CVC) ; afficher un
 * baseline transport contredirait l'architecture SEO et ferait fuir les
 * visiteurs venus des requêtes maintenance ou dépannage.
 * Le logo web se limite à la marque : le « A » triangulaire + ARGON.
 *
 * Le nom est du vrai texte : lisible, sélectionnable, accessible, et aucune
 * image supplémentaire à charger (cahier V2 §29).
 */
export function Logo({ id = "argon-logo", markOnly = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md",
        "transition-opacity hover:opacity-85",
        className,
      )}
      aria-label="Argon — retour à l'accueil"
    >
      <LogoMark id={id} className="h-7 w-7 shrink-0 text-argon" />
      {markOnly ? null : (
        <span className="text-[19px] font-semibold tracking-[0.14em] text-ink">
          ARGON
        </span>
      )}
    </Link>
  );
}
