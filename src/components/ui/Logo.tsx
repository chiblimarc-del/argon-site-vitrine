import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Marque Argon — le « A » triangulaire de l'identité.
 *
 * Tracé OFFICIEL, repris tel quel du paquet vectoriel de la charte
 * (`package_print/base/icon`), converti du PDF sans retouche : les
 * proportions et les angles sont ceux du fichier source, pas une
 * approximation. Le tracé qui vivait ici auparavant était une reconstruction
 * géométrique dont l'entaille détachait entièrement la jambe inférieure
 * gauche — le triangle se lisait cassé.
 *
 * Un seul sous-tracé, refermé sur lui-même : l'évidement central est creusé
 * par la règle de remplissage `nonzero`, sans masque ni `evenodd` — c'est
 * exactement ce que fait le fichier de la charte. Accessoirement, un masque
 * SVG n'est pas rendu partout : cairosvg, par exemple, l'ignore et produit un
 * triangle plein. Le tracé simple n'a pas ce risque.
 *
 * La couleur vient de `currentColor` : la marque prend celle du texte
 * environnant, ce qui la rend utilisable sur fond clair comme sur fond sombre
 * sans dupliquer le tracé.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 84.359 87.418"
      aria-hidden="true"
      focusable="false"
      // Ni hauteur ni largeur par défaut : elles sont imposées par l'appelant.
      // Un SVG sans attributs width/height retombe sinon sur la largeur des
      // éléments remplacés (300 px), ce qui faisait déborder le header.
      className={cn(className)}
    >
      <path fill="currentColor" fillRule="nonzero" d="M36.453 49.215L42.137 37.414L58.48 71.16L33.043 71.16L25.262 87.418L84.359 87.418L42.137 0L0 87.418L18.008 87.418Z" />
    </svg>
  );
}

interface LogoProps {
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
export function Logo({ markOnly = false, className }: LogoProps) {
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
      <LogoMark className="h-7 w-7 shrink-0 text-argon" />
      {markOnly ? null : (
        <span className="text-[19px] font-semibold tracking-[0.14em] text-ink">
          ARGON
        </span>
      )}
    </Link>
  );
}
