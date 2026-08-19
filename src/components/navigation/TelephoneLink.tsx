import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/** Même raison que dans EspaceClient : la taille est une variante, jamais une
 *  classe surchargée depuis l'extérieur. `cn()` ne fusionne pas les conflits. */
const tailles = {
  md: "px-1 py-2 text-sm",
  lg: "py-3 text-base",
} as const;

/**
 * Numéro de téléphone cliquable, dans l'en-tête et dans le menu mobile.
 *
 * DEUX ÉCRITURES DU MÊME NUMÉRO, et ce n'est pas une redondance :
 *   — `site.phone` est la forme lisible, affichée (01 85 73 59 41) ;
 *   — `site.phoneInternational` est la forme composable, dans le `href`
 *     (+33185735941) : sans indicatif, un appel depuis l'étranger échoue.
 * Aucune des deux n'est écrite en dur ici — `lib/site.ts` reste la source.
 *
 * Le composant ne rend RIEN si le numéro n'est pas renseigné : c'est la règle
 * de vérité du projet (V2 §31), pas une précaution de style. Un numéro de
 * remplissage dans un en-tête est une promesse de joignabilité mensongère.
 */
export function TelephoneLink({
  taille = "md",
  className,
}: {
  taille?: keyof typeof tailles;
  className?: string;
}) {
  if (!site.phone || !site.phoneInternational) return null;

  return (
    <a
      href={`tel:${site.phoneInternational}`}
      aria-label={`Nous appeler au ${site.phone}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-medium " +
          "text-ink-soft transition-colors hover:text-ink",
        tailles[taille],
        className,
      )}
    >
      <PhoneIcon />
      <span className="tabular-nums">{site.phone}</span>
    </a>
  );
}

/** Combiné décoratif. Le libellé du lien porte déjà l'information. */
function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 text-accent-text"
    >
      <path
        d="M5.4 2.75H3.9c-.7 0-1.25.58-1.19 1.27.2 2.3 1.16 4.44 2.72 6a10.2 10.2 0 0 0 6 2.72c.69.06 1.27-.49 1.27-1.19v-1.5c0-.6-.43-1.11-1.02-1.21l-1.3-.22a1.23 1.23 0 0 0-1.16.44l-.44.55a8.1 8.1 0 0 1-3.02-3.02l.55-.44c.34-.28.5-.73.44-1.16l-.22-1.3A1.23 1.23 0 0 0 5.4 2.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
