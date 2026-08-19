import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { NavLink } from "@/components/navigation/NavLink";
import { Button, ArrowRight } from "@/components/ui/Button";
import { metadataFor, webPageSchema } from "@/lib/seo";
import { getRoute, solutionRoutes } from "@/lib/routes";
import { primaryCta } from "@/lib/site";

/**
 * HUB /solutions — PAGE NAVIGATIONNELLE.
 *
 * ⚠️ P3, `keyword: null` au registre. Cette page ne vise AUCUNE requête et ne
 * doit jamais chercher à se positionner : elle concurrencerait ses propres
 * pages filles, qui portent chacune une intention. C'est la décision prise en
 * architecture V3 et elle ne se rediscute pas ici.
 *
 * Sa valeur est structurelle, pas éditoriale. Elle lève trois blocages relevés
 * à l'audit global :
 *   1. le `BreadcrumbList` structuré des pages solutions, jusqu'ici absent
 *      faute de parent publié ;
 *   2. le CTA secondaire du Hero de l'accueil, masqué faute de destination ;
 *   3. le déclencheur « Solutions » du menu, qui devient un vrai lien donc
 *      focusable au clavier.
 *
 * Contenu volontairement minimal : cinq cartes et deux phrases. Une page de hub
 * étoffée artificiellement serait exactement le fourre-tout que nous avons
 * supprimé en retirant /fonctionnalites.
 *
 * Les cartes sont lues depuis le registre : libellés, pitchs et état de
 * publication. Les deux solutions non encore construites apparaissent comme
 * telles, sans lien mort.
 */

const PATH = "/solutions";

export const metadata = metadataFor(PATH);

/** Les trois temps de la chaîne, pour ordonner la lecture des cartes. */
const rythme: Record<string, string> = {
  "/solutions/gestion-interventions": "Le cœur",
  "/solutions/planning-interventions": "L'organisation",
  "/solutions/devis-facturation": "La boucle commerciale",
  "/solutions/application-mobile-technicien": "Le terrain",
  "/solutions/rapports-intervention": "La preuve",
};

export default function SolutionsPage() {
  const route = getRoute(PATH);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line-soft">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="grid-bg absolute inset-0" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl py-16 sm:py-20">
            <h1 className="text-[2.3rem] font-semibold leading-[1.1] text-ink sm:text-5xl">
              {route.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Cinq briques, une seule donnée qui circule. Chacune a sa page :
              ce qu&apos;elle fait, ce qu&apos;elle ne fait pas, et comment elle
              s&apos;articule avec les autres.
            </p>
          </div>
        </Container>
      </section>

      <Section containerWidth="wide">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solutionRoutes.map((solution) => (
            <li key={solution.path}>
              <article
                className={`card relative flex h-full flex-col p-6${
                  solution.published
                    ? " transition-colors duration-200 hover:border-accent/40 hover:bg-surface-2"
                    : ""
                }`}
              >
                {rythme[solution.path] ? (
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                    {rythme[solution.path]}
                  </p>
                ) : null}

                <h2 className="mt-2 text-[17px] font-semibold text-ink">
                  {solution.published ? (
                    <NavLink
                      href={solution.path}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {solution.label}
                    </NavLink>
                  ) : (
                    solution.label
                  )}
                </h2>

                {solution.pitch ? (
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    {solution.pitch}
                  </p>
                ) : null}

                <div className="mt-auto pt-6">
                  {solution.published ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-text">
                      Voir la page
                      <ArrowRight />
                    </span>
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

        <div className="mt-14 flex flex-col items-start gap-5 border-t border-line-soft pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Le plus simple reste de voir la chaîne complète sur votre propre
            activité.
          </p>
          <Button href={primaryCta.href} size="lg">
            {primaryCta.label}
            <ArrowRight />
          </Button>
        </div>
      </Section>

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
