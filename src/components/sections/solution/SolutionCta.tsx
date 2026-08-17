import { Section } from "@/components/ui/Section";
import { Button, ArrowRight } from "@/components/ui/Button";
import { primaryCta } from "@/lib/site";

/**
 * Clôture d'une page solution. Même sobriété que le CTA de l'accueil : le
 * visiteur arrivé en bas n'a plus rien à apprendre, il a une décision à prendre.
 *
 * RÈGLE DE VÉRITÉ (V2 §31) : aucune offre commerciale — ni essai, ni gratuité,
 * ni « sans engagement », ni délai de rappel.
 */
export function SolutionCta({
  titre,
  texte,
}: {
  titre: string;
  texte: string;
}) {
  return (
    <Section tone="alt" spacing="large">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
          {titre}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
          {texte}
        </p>
        <div className="mt-9 flex justify-center">
          <Button href={primaryCta.href} size="lg">
            {primaryCta.label}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </Section>
  );
}
