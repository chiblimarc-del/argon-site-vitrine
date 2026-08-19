import { cn } from "@/lib/cn";
import { espaceClient } from "@/lib/site";

/**
 * ⚠️ LA TAILLE EST UNE VARIANTE, PAS UNE CLASSE PASSÉE DE L'EXTÉRIEUR.
 * `cn()` est un simple `join` — le projet n'embarque pas tailwind-merge
 * (cahier V2 §29). Passer `h-12` par-dessus un `h-10` déjà posé ne remplace
 * rien : c'est l'ordre du CSS généré qui tranche, et il ne dit pas ce qu'on
 * croit. Toute nouvelle taille s'ajoute ICI, dans `tailles`.
 */
const tailles = {
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
} as const;

/**
 * Pastille « Connexion client » — action principale de l'en-tête depuis le
 * 19/08/2026, en remplacement de « Demander une démo ».
 *
 * POURQUOI CE REMPLACEMENT — l'accueil ouvre déjà sur le CTA de démonstration,
 * en pleine page. Le répéter dans la barre le rendait invisible à force d'être
 * partout. L'en-tête sert désormais les visiteurs qui reviennent : ceux qui ont
 * déjà signé et cherchent leur espace, et ceux qui veulent parler à quelqu'un.
 *
 * ⚠️ URL EXTERNE : <a> natif, jamais `Button` ni `NavLink` — les deux passent
 * par `next/link`, qui préfetche et intercepte la navigation. Voir la note dans
 * `lib/site.ts`.
 *
 * L'animation vit dans `.pastille-connexion` (globals.css), pas ici : c'est du
 * mouvement, donc du design system, et elle doit rester coupable d'un seul
 * endroit. Les classes de forme et de couleur reprennent volontairement celles
 * du `Button` primaire de taille `md`, pour que la pastille ne devienne pas un
 * dialecte visuel à part.
 */
export function EspaceClient({
  taille = "md",
  className,
}: {
  taille?: keyof typeof tailles;
  className?: string;
}) {
  return (
    <a
      href={espaceClient.href}
      rel="noopener"
      className={cn(
        "pastille-connexion inline-flex items-center justify-center gap-2 " +
          "whitespace-nowrap rounded-full bg-accent font-medium text-white " +
          "transition-colors duration-200 hover:bg-accent-hover",
        tailles[taille],
        className,
      )}
    >
      {espaceClient.label}
      <LockIcon />
    </a>
  );
}

/** Cadenas décoratif. Masqué aux lecteurs d'écran : le libellé dit déjà tout. */
function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <rect
        x="3.25"
        y="7"
        width="9.5"
        height="6.25"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5.75 7V5.25a2.25 2.25 0 0 1 4.5 0V7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
