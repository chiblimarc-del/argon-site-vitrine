import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { NavLink } from "@/components/navigation/NavLink";
import { Button, ArrowRight } from "@/components/ui/Button";
import { metadataFor, webPageSchema, breadcrumbSchema } from "@/lib/seo";
import { getRoute, secteurRoutes } from "@/lib/routes";
import { primaryCta } from "@/lib/site";

/**
 * HUB /secteurs — PAGE NAVIGATIONNELLE.
 *
 * ⚠️ P3, `keyword: null`. Comme /solutions, cette page ne vise aucune requête :
 * elle concurrencerait ses cinq pages filles, qui portent chacune leur
 * intention métier. Décision d'architecture V3, elle ne se rediscute pas ici.
 *
 * Elle rend le menu « Secteurs » atteignable au clavier (le déclencheur devient
 * un vrai lien) et débloque le `BreadcrumbList` des pages métiers.
 *
 * Le rythme de travail affiché sur chaque carte reprend celui de la section
 * métiers de l'accueil : c'est le même angle éditorial d'un bout à l'autre du
 * site — chaque métier a son tempo, pas seulement son nom.
 */

const PATH = "/secteurs";

export const metadata = metadataFor(PATH);

const rythme: Record<string, string> = {
  "/secteurs/maintenance": "La récurrence",
  "/secteurs/depannage": "La réaction",
  "/secteurs/installation": "Les phases",
  "/secteurs/transport-courses": "L'enchaînement",
  "/secteurs/cvc": "La saisonnalité",
};

export default function SecteursPage() {
  const route = getRoute(PATH);

  return (
    <>
      <Breadcrumbs path={PATH} />

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
              Le cycle de gestion est le même pour tous : une demande, une
              intervention, un compte rendu, une facture. Ce qui change,
              c&apos;est le rythme de la journée et le vocabulaire.
            </p>
          </div>
        </Container>
      </section>

      <Section containerWidth="wide">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {secteurRoutes.map((secteur) => (
            <li key={secteur.path}>
              <article
                className={`card relative flex h-full flex-col p-6${
                  secteur.published
                    ? " transition-colors duration-200 hover:border-accent/40 hover:bg-surface-2"
                    : ""
                }`}
              >
                {rythme[secteur.path] ? (
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                    {rythme[secteur.path]}
                  </p>
                ) : null}

                <h2 className="mt-2 text-[17px] font-semibold text-ink">
                  {secteur.published ? (
                    <NavLink
                      href={secteur.path}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {secteur.label}
                    </NavLink>
                  ) : (
                    secteur.label
                  )}
                </h2>

                {secteur.pitch ? (
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    {secteur.pitch}
                  </p>
                ) : null}

                <div className="mt-auto pt-6">
                  {secteur.published ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-text">
                      Voir la page
                      <ArrowRight />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
                      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ink-muted" />
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
            Votre activité ne figure pas dans cette liste ? Le socle reste le
            même dès lors que vos équipes travaillent hors des murs.
          </p>
          <Button href={primaryCta.href} size="lg">
            {primaryCta.label}
            <ArrowRight />
          </Button>
        </div>
      </Section>

      <JsonLd data={webPageSchema(PATH)} />
      <JsonLd data={breadcrumbSchema(PATH)} />
    </>
  );
}
