import { Section, SectionHeading } from "@/components/ui/Section";
import { NavLink } from "@/components/navigation/NavLink";
import { ArrowRight } from "@/components/ui/Button";
import { findRoute } from "@/lib/routes";

/**
 * Maillage interne d'une page solution.
 *
 * Le cahier V2 §23 fixe le sens des liens : une page solution renvoie vers les
 * autres solutions du parcours et vers les métiers concernés. Les libellés et
 * les pitchs viennent du registre — aucune duplication de contenu, et si une
 * route est renommée, les liens suivent.
 *
 * Une route non publiée s'affiche en gris avec la mention « en préparation »
 * plutôt qu'en lien mort. Elle devient cliquable d'elle-même le jour où la
 * page est construite.
 */
export function RelatedPages({
  titre,
  chapo,
  paths,
  motifs,
}: {
  titre: string;
  chapo?: string;
  paths: string[];
  /**
   * Motif du lien, par chemin cible. Facultatif : sans lui, le pitch du
   * registre s'affiche comme avant, et les usages existants ne changent pas.
   *
   * ⚠️ Le motif PRIME sur le pitch, et c'est tout l'objet. Le pitch décrit la
   * page d'arrivée pour tout le monde ; le motif dit pourquoi ce lien-là
   * depuis CETTE page-ci. C'est ce qui distingue un maillage d'une liste de
   * liens — l'audit du 20/08 relevait que les cinq pages métier renvoyaient
   * au même triplet, dans un ordre à peine différent.
   */
  motifs?: Record<string, string>;
}) {
  const routes = paths.map(findRoute).filter((route) => route !== undefined);
  if (!routes.length) return null;

  return (
    <Section>
      <SectionHeading as="h2" title={titre} description={chapo} className="max-w-2xl" />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <li key={route.path}>
            <article className="card flex h-full flex-col p-5">
              <h3 className="text-[15px] font-semibold text-ink">{route.label}</h3>

              {motifs?.[route.path] ?? route.pitch ? (
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                  {motifs?.[route.path] ?? route.pitch}
                </p>
              ) : null}

              <div className="mt-auto pt-5">
                {route.published ? (
                  <NavLink
                    href={route.path}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-text"
                  >
                    Voir la page
                    <ArrowRight />
                  </NavLink>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-ink-muted"
                    />
                    En préparation
                  </span>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
