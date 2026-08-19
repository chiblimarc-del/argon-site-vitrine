import { Container } from "@/components/ui/Container";
import { NavLink } from "@/components/navigation/NavLink";
import { breadcrumbsFor } from "@/lib/routes";
import { cn } from "@/lib/cn";

/**
 * ⚠️ COMPOSANT NON MONTÉ DEPUIS LE 19/08/2026.
 *
 * Le fil d'Ariane a été retiré de toutes les pages : sous l'en-tête, la barre
 * « Accueil / Secteurs » se lisait comme deux onglets sans fonction. Le JSON-LD
 * `breadcrumbSchema` a été retiré en même temps — voir la note dans lib/seo.ts.
 *
 * Le fichier est gardé pour que le retour arrière soit un import, pas une
 * réécriture. Si personne ne le remonte, `git rm` est le bon geste.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Fil d'Ariane visible, dérivé du registre de routes.
 * Doit toujours être accompagné du JSON-LD `breadcrumbSchema(path)` :
 * Google exige que les données structurées reflètent un contenu visible.
 *
 * Ne rend rien sur l'accueil (un seul niveau).
 */
export function Breadcrumbs({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  const trail = breadcrumbsFor(path);
  if (trail.length < 2) return null;

  return (
    <nav aria-label="Fil d'Ariane" className={cn("border-b border-line-soft", className)}>
      <Container>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 py-4 text-xs text-ink-muted">
          {trail.map((route, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={route.path} className="flex items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="text-ink-soft">
                    {route.label}
                  </span>
                ) : (
                  <>
                    <NavLink
                      href={route.path}
                      className="transition-colors hover:text-ink-soft"
                    >
                      {route.label}
                    </NavLink>
                    <span aria-hidden="true" className="opacity-50">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
