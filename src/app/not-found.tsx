import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { Button, ArrowRight } from "@/components/ui/Button";
import { NavLink } from "@/components/navigation/NavLink";
import { solutionRoutes, secteurRoutes } from "@/lib/routes";
import { primaryCta } from "@/lib/site";

/**
 * Page 404. Volontairement utile : elle propose les pages solutions et
 * métiers, ce qui limite les sorties et alimente le maillage interne.
 * `noindex, follow` : une 404 ne doit jamais être indexée.
 */
export const metadata: Metadata = {
  title: "Page introuvable | Argon",
  robots: { index: false, follow: true },
  /**
   * ⚠️ `canonical: null` ANNULE l'héritage du layout racine, qui déclare
   * `alternates: { canonical: "/" }`. Sans cette ligne, la page 404 se
   * déclare canonique de l'ACCUEIL : chaque URL erronée du site portait une
   * balise canonical vers `/`. Sans conséquence aujourd'hui — la page est en
   * noindex, Google ne suit pas le canonical d'une page qu'il n'indexe pas —
   * mais c'est un signal contradictoire, et le genre de ligne qu'on ne
   * retrouve jamais le jour où elle nuit.
   *
   * Toutes les autres pages passent par `metadataFor`, qui pose leur propre
   * canonical. Celle-ci est la seule à ne pas le faire : elle n'a pas de
   * route au registre.
   */
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <Section spacing="large">
      <p className="text-sm font-medium tracking-[0.14em] text-accent-text">ERREUR 404</p>
      <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
        Cette page n&apos;existe pas.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
        Le lien est peut-être obsolète ou l&apos;adresse mal orthographiée.
        Voici les pages les plus consultées.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button href="/" size="lg">
          Retour à l&apos;accueil
          <ArrowRight />
        </Button>
        <Button href={primaryCta.href} variant="secondary" size="lg">
          {primaryCta.label}
        </Button>
      </div>

      <div className="mt-14 grid gap-10 border-t border-line-soft pt-10 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
            Solutions
          </h2>
          <ul className="space-y-2.5">
            {solutionRoutes.map((route) => (
              <li key={route.path}>
                <NavLink
                  href={route.path}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
            Secteurs
          </h2>
          <ul className="space-y-2.5">
            {secteurRoutes.map((route) => (
              <li key={route.path}>
                <NavLink
                  href={route.path}
                  className="text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
