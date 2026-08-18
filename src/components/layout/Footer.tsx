import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { NavLink } from "@/components/navigation/NavLink";
import { site } from "@/lib/site";
import {
  solutionRoutes,
  secteurRoutes,
  legalRoutes,
  findRoute,
} from "@/lib/routes";

/**
 * Pied de page. Porte l'essentiel du maillage interne : chaque page
 * solution et chaque page métier y est liée depuis toutes les pages du site,
 * ce qui évite toute page orpheline (exigence SEO du cahier V2).
 *
 * Les liens vers des pages non encore publiées s'affichent en gris et ne sont
 * pas cliquables — voir NavLink. Aucun lien mort n'est donc émis.
 */

const linkClasses =
  "text-sm text-ink-soft transition-colors hover:text-ink";

const columns = [
  { title: "Solutions", hub: "/solutions", items: solutionRoutes },
  { title: "Secteurs", hub: "/secteurs", items: secteurRoutes },
];

const produit = ["/demander-une-demo"];
const entreprise = ["/a-propos", "/contact"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line-soft bg-canvas-2">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8 lg:py-16">
          {/* Identité */}
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Le logiciel de pilotage des opérations terrain.
            </p>
          </div>

          {/* Colonnes issues du registre de routes */}
          {columns.map((column) => (
            <FooterColumn key={column.title} title={column.title} hub={column.hub}>
              {column.items.map((item) => (
                <li key={item.path}>
                  <NavLink href={item.path} className={linkClasses}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </FooterColumn>
          ))}

          <FooterColumn title="Produit">
            {produit.map((path) => (
              <FooterLink key={path} path={path} />
            ))}
          </FooterColumn>

          <FooterColumn title="Entreprise">
            {entreprise.map((path) => (
              <FooterLink key={path} path={path} />
            ))}
          </FooterColumn>
        </div>

        {/* Barre légale */}
        <div className="flex flex-col gap-4 border-t border-line-soft py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted">
            © {year} {site.name}. Tous droits réservés.
          </p>

          {/*
            Pages légales : obligatoires en France (mentions légales pour tout
            site professionnel, politique de confidentialité dès la collecte de
            données via le formulaire de démo). Publiées le 18/08/2026, donc
            cliquables — `NavLink` les grisait automatiquement tant que le
            registre les déclarait `published: false`.
          */}
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalRoutes.map((route) => (
              <li key={route.path}>
                <NavLink
                  href={route.path}
                  className="text-xs text-ink-muted transition-colors hover:text-ink-soft"
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  hub,
  children,
}: {
  title: string;
  hub?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
        {hub ? (
          <NavLink href={hub} className="transition-colors hover:text-ink-soft">
            {title}
          </NavLink>
        ) : (
          title
        )}
      </h2>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ path }: { path: string }) {
  const route = findRoute(path);
  if (!route) return null;
  return (
    <li>
      <NavLink href={path} className={linkClasses}>
        {route.label}
      </NavLink>
    </li>
  );
}
