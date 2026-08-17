import { cn } from "@/lib/cn";
import { NavLink } from "@/components/navigation/NavLink";
import { findRoute, solutionRoutes, secteurRoutes } from "@/lib/routes";

/**
 * Navigation principale, écrans ≥ lg.
 *
 * Les menus déroulants sont en CSS pur (group-hover + focus-within) :
 * zéro JavaScript envoyé au navigateur, et les liens restent dans le HTML
 * initial, donc crawlables sans exécution de script.
 */

/**
 * Panneau déroulant.
 *
 * ⚠️ NE JAMAIS revenir à `invisible` (visibility: hidden) : un élément ainsi
 * masqué n'est PAS focusable, donc `focus-within` ne peut jamais se déclencher
 * et la navigation principale devient inatteignable au clavier (échec
 * WCAG 2.1.1). C'est le défaut relevé à l'audit global.
 *
 * `opacity-0` + `pointer-events-none` masque visuellement tout en gardant les
 * liens dans l'ordre de tabulation : le panneau s'ouvre dès qu'un lien reçoit
 * le focus, exactement comme au survol. Toujours zéro JavaScript.
 */
const panelClasses =
  "pointer-events-none absolute left-1/2 top-full z-50 w-[30rem] -translate-x-1/2 pt-3 opacity-0 " +
  "transition-opacity duration-150 " +
  "group-hover:pointer-events-auto group-hover:opacity-100 " +
  "group-focus-within:pointer-events-auto group-focus-within:opacity-100";

const triggerClasses =
  "inline-flex items-center gap-1 rounded-md px-1 py-2 text-sm text-ink-soft " +
  "transition-colors hover:text-ink group-hover:text-ink group-focus-within:text-ink";

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="h-3 w-3 opacity-60">
      <path
        d="M3 4.5 6 7.5 9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DropdownPanel({
  hubPath,
  hubLabel,
  items,
}: {
  hubPath: string;
  hubLabel: string;
  items: typeof solutionRoutes;
}) {
  const hub = findRoute(hubPath);
  return (
    <div className={panelClasses}>
      <div className="card overflow-hidden p-2 shadow-2xl shadow-black/50">
        <ul className="grid gap-0.5">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                href={item.path}
                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-2"
              >
                <span className="block text-sm font-medium text-ink">
                  {item.label}
                </span>
                {item.pitch ? (
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                    {item.pitch}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>

        {hub ? (
          <div className="mt-2 border-t border-line-soft pt-2">
            <NavLink
              href={hubPath}
              className="block rounded-lg px-3 py-2 text-xs font-medium text-accent-text transition-colors hover:bg-surface-2"
            >
              Voir toutes les pages {hubLabel.toLowerCase()}
            </NavLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DesktopNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Navigation principale" className={cn("items-center", className)}>
      <ul className="flex items-center gap-7">
        {/*
          Le déclencheur est un NavLink et non un <span> : quand le hub est
          publié, il devient un vrai lien, donc focusable — le menu s'ouvre au
          clavier dès qu'on l'atteint, sans attendre d'être entré dans le
          panneau. Tant que le hub n'existe pas, NavLink le rend inerte.
        */}
        <li className="group relative">
          <NavLink href="/solutions" className={triggerClasses}>
            Solutions
            <Chevron />
          </NavLink>
          <DropdownPanel
            hubPath="/solutions"
            hubLabel="Solutions"
            items={solutionRoutes}
          />
        </li>

        <li className="group relative">
          <NavLink href="/secteurs" className={triggerClasses}>
            Secteurs
            <Chevron />
          </NavLink>
          <DropdownPanel hubPath="/secteurs" hubLabel="Secteurs" items={secteurRoutes} />
        </li>

        <li>
          <NavLink
            href="/a-propos"
            className="rounded-md px-1 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            À propos
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
