import { Section } from "@/components/ui/Section";
import { Button, ArrowRight } from "@/components/ui/Button";
import { primaryCta, secondaryCta } from "@/lib/site";
import { findRoute, secteurRoutes } from "@/lib/routes";

/**
 * SECTION 6 — CTA FINAL.
 *
 * Volontairement la section la plus calme de la page. Après le diagnostic, la
 * chaîne, les briques et les métiers, le visiteur n'a plus rien à apprendre :
 * il a une décision à prendre. Tout ce qui capterait encore l'attention lui
 * nuirait.
 *
 * Conséquences assumées :
 *   - aucune interface produit (il y en a déjà deux plus haut) ;
 *   - aucun halo, aucune grille de fond, aucun dégradé de texte ;
 *   - une seule colonne centrée, beaucoup de vide ;
 *   - les cinq métiers rappelés en une ligne discrète, sans lien ni carte.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ (cahier V2 §31)
 * Aucune offre commerciale n'est évoquée : ni durée d'essai, ni gratuité, ni
 * « sans engagement », ni tarif, ni délai de mise en route. Rien de tout cela
 * n'est validé, et un CTA qui promet une modalité inexistante se paie en
 * démonstration.
 *
 * Aucune preuve fabriquée non plus : pas de logo client, pas de témoignage,
 * pas de chiffre.
 * ─────────────────────────────────────────────────────────────────────────
 */
export function FinalCtaSection() {
  /**
   * Le CTA secondaire n'apparaît que si sa destination existe ET est publiée
   * au registre. Aujourd'hui `/solutions` ne l'est pas : le bouton reste donc
   * absent plutôt que de mener à une page inexistante. Il s'affichera de
   * lui-même le jour où la route passera à `published: true`.
   */
  const routeSecondaire = findRoute(secondaryCta.href);
  const secondaireDisponible = routeSecondaire?.published ?? false;

  return (
    <Section spacing="large" containerWidth="default">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold leading-[1.15] text-ink sm:text-4xl lg:text-[2.75rem]">
          Une seule gestion, du client au terrain.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Vos demandes, vos devis, vos interventions et vos factures restent
          dans le même flux. Découvrez comment Argon peut s&apos;adapter à
          votre activité.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={primaryCta.href} size="lg">
            {primaryCta.label}
            <ArrowRight />
          </Button>

          {secondaireDisponible ? (
            <Button href={secondaryCta.href} variant="secondary" size="lg">
              {secondaryCta.label}
            </Button>
          ) : null}
        </div>

        {/* Rappel discret des cinq métiers : du texte, pas des cartes. */}
        <div className="mt-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            Pour les entreprises de
          </p>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            {secteurRoutes.map((secteur, index) => (
              <li
                key={secteur.path}
                className="flex items-center gap-3 text-sm text-ink-soft"
              >
                {index > 0 ? (
                  <span aria-hidden="true" className="text-ink-muted opacity-50">
                    ·
                  </span>
                ) : null}
                {secteur.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
