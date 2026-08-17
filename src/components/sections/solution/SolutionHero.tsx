import { Container } from "@/components/ui/Container";
import { Button, ArrowRight } from "@/components/ui/Button";
import { getRoute } from "@/lib/routes";
import { primaryCta } from "@/lib/site";

/**
 * En-tête commun aux pages « solution » ET aux pages « secteur ».
 *
 * Les deux axes partagent la même ossature de page (hero → corps propre →
 * FAQ → maillage → CTA) ; seul le corps diffère. Le composant est resté dans
 * le dossier `solution/` par continuité, mais il n'a rien de spécifique.
 *
 * Le H1 vient du registre de routes : impossible qu'il diverge du H1 déclaré
 * dans la matrice SEO, et `seo:check` garantit qu'il est unique sur le site.
 *
 * Une seule règle de rédaction pour `chapo` : répondre en deux phrases aux
 * trois questions du cahier V2 §30 — pour qui, quel problème, quelle action.
 */
export function SolutionHero({
  path,
  eyebrow,
  chapo,
  /** Mot ou groupe de mots du H1 qui portera le dégradé. Optionnel. */
  accentue,
}: {
  path: string;
  eyebrow: string;
  chapo: string;
  accentue?: string;
}) {
  const route = getRoute(path);

  return (
    <section className="relative overflow-hidden border-b border-line-soft">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="grid-bg absolute inset-0" />
        <div className="glow left-[-12%] top-[-25%] h-[360px] w-[360px] bg-accent/15" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl py-16 sm:py-20 lg:py-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-argon" />
            {eyebrow}
          </p>

          <h1 className="mt-6 text-[2.3rem] font-semibold leading-[1.1] text-ink sm:text-5xl">
            {accentue ? <TitreAccentue titre={route.h1} accentue={accentue} /> : route.h1}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {chapo}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
              <ArrowRight />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Applique le dégradé de marque à un fragment du H1, sans dupliquer le texte.
 * Si le fragment est absent du titre, on rend le titre tel quel plutôt que de
 * risquer un H1 tronqué.
 */
function TitreAccentue({ titre, accentue }: { titre: string; accentue: string }) {
  const index = titre.indexOf(accentue);
  if (index === -1) return <>{titre}</>;

  return (
    <>
      {titre.slice(0, index)}
      <span className="text-gradient">{accentue}</span>
      {titre.slice(index + accentue.length)}
    </>
  );
}
