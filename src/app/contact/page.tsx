import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button, ArrowRight } from "@/components/ui/Button";
import { NavLink } from "@/components/navigation/NavLink";
import { metadataFor, webPageSchema, breadcrumbSchema } from "@/lib/seo";
import { getRoute } from "@/lib/routes";
import { site, primaryCta } from "@/lib/site";

/**
 * PAGE CONTACT — utilitaire.
 *
 * Volontairement minimale : elle oriente vers le bon canal, elle ne raconte
 * rien. `keyword: null` au registre — son rôle est navigationnel.
 *
 * ⚠️ AUCUNE COORDONNÉE INVENTÉE. Les coordonnées affichées viennent
 * exclusivement de `src/lib/site.ts` et n'y sont renseignées que lorsqu'elles
 * sont réelles — e-mail et téléphone l'ont été par le client. Toute valeur
 * absente reste vide et son bloc ne s'affiche pas : mieux vaut un seul canal
 * réel qu'une coordonnée de remplissage.
 *
 * Même logique pour le renvoi aux mentions légales : il n'apparaît que si la
 * page est publiée au registre.
 */

const PATH = "/contact";

export const metadata = metadataFor(PATH);

export default function ContactPage() {
  const route = getRoute(PATH);
  const aDesCoordonnees = Boolean(site.email || site.phone);

  return (
    <>
      <Breadcrumbs path={PATH} />

      <section className="relative overflow-hidden border-b border-line-soft">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="grid-bg absolute inset-0" />
        </div>
        <Container className="relative z-10">
          <div className="max-w-2xl py-16 sm:py-20">
            <h1 className="text-[2.3rem] font-semibold leading-[1.1] text-ink sm:text-5xl">
              {route.h1}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
              Le plus utile, dans la plupart des cas, est de nous montrer
              comment vous travaillez aujourd&apos;hui. C&apos;est ce qui permet
              de vous dire rapidement si Argon correspond à votre organisation
              — ou si ce n&apos;est pas le bon outil.
            </p>
          </div>
        </Container>
      </section>

      <Section containerWidth="default">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Canal principal : la démonstration. */}
          <article className="card flex flex-col p-6 sm:p-7">
            <h2 className="text-[17px] font-semibold text-ink">
              Demander une démonstration
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              Vous décrivez votre activité, nous vous montrons Argon sur vos
              propres cas : vos types de missions, vos équipes, votre
              organisation.
            </p>
            <div className="mt-auto pt-7">
              <Button href={primaryCta.href} size="md">
                {primaryCta.label}
                <ArrowRight />
              </Button>
            </div>
          </article>

          {/* Canal secondaire : n'existe que si les coordonnées sont réelles. */}
          <article className="card flex flex-col p-6 sm:p-7">
            <h2 className="text-[17px] font-semibold text-ink">Nous écrire</h2>

            {aDesCoordonnees ? (
              <>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                  Pour une question qui ne nécessite pas de démonstration.
                </p>
                <dl className="mt-5 space-y-3">
                  {site.email ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                        E-mail
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${site.email}`}
                          className="text-[15px] text-accent-text"
                        >
                          {site.email}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {site.phone ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                        Téléphone
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={`tel:${site.phoneInternational || site.phone.replace(/\s+/g, "")}`}
                          className="text-[15px] text-accent-text"
                        >
                          {site.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </>
            ) : (
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                Le formulaire de demande de démonstration reste, pour
                l&apos;instant, le moyen le plus direct de nous joindre : il
                arrive dans la même boîte, que votre message porte sur une
                démonstration ou sur une simple question.
              </p>
            )}

            {/*
              Renvoi aux mentions légales : affiché uniquement si la page est
              réellement publiée. Annoncer que « les informations figurent dans
              les mentions légales » alors que la page n'existe pas serait une
              promesse fausse — et un renvoi inerte souligné, un lien mort
              visuel. Le bloc apparaîtra seul le jour où la page sera publiée.
            */}
            {getRoute("/mentions-legales").published ? (
              <div className="mt-auto pt-7">
                <p className="text-[13px] leading-relaxed text-ink-muted">
                  Les informations sur l&apos;éditeur du site figurent dans les{" "}
                  <NavLink href="/mentions-legales" className="underline">
                    mentions légales
                  </NavLink>
                  .
                </p>
              </div>
            ) : null}
          </article>
        </div>
      </Section>

      <JsonLd data={webPageSchema(PATH)} />
      <JsonLd data={breadcrumbSchema(PATH)} />
    </>
  );
}
