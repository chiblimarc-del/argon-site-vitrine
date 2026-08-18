import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getRoute } from "@/lib/routes";

/**
 * Ossature commune aux deux pages légales.
 *
 * Elles ne partagent l'ossature d'aucune autre page du site, et c'est
 * délibéré : pas de hero à dégradé, pas de bouton d'appel à l'action, pas de
 * maillage interne. Un visiteur qui ouvre les mentions légales cherche une
 * information précise — l'y noyer sous du discours commercial serait à la fois
 * inutile et douteux.
 *
 * Le H1 vient du registre de routes, comme partout ailleurs : `seo:check`
 * garantit qu'il est unique sur le site.
 */
export function LegalHero({
  path,
  chapo,
  miseAJour,
}: {
  path: string;
  chapo: string;
  miseAJour: string;
}) {
  const route = getRoute(path);

  return (
    <section className="border-b border-line-soft">
      <Container>
        <div className="max-w-3xl py-14 sm:py-16">
          <h1 className="text-[2rem] font-semibold leading-[1.15] text-ink sm:text-4xl">
            {route.h1}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-soft">{chapo}</p>
          <p className="mt-6 text-xs text-ink-muted">{miseAJour}</p>
        </div>
      </Container>
    </section>
  );
}

/** Bloc de texte légal. Numéroté visuellement, pour pouvoir s'y référer. */
export function LegalBloc({
  numero,
  titre,
  children,
}: {
  numero: string;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line-soft pt-10 first:border-t-0 first:pt-0">
      <span className="font-mono text-[12px] text-accent-text">{numero}</span>
      <h2 className="mt-2 text-[20px] font-semibold text-ink sm:text-[22px]">
        {titre}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

/**
 * Liste d'identification. Une `<dl>` plutôt que des paragraphes : ces
 * informations se consultent, elles ne se lisent pas.
 */
export function LegalIdentite({
  entrees,
}: {
  entrees: { terme: string; valeur: string }[];
}) {
  return (
    <dl className="card grid gap-x-8 gap-y-3 p-6 sm:grid-cols-[minmax(0,14rem)_1fr]">
      {entrees.map((entree) => (
        <div key={entree.terme} className="contents">
          <dt className="text-[13px] font-medium text-ink-muted">{entree.terme}</dt>
          <dd className="text-[15px] text-ink">{entree.valeur}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Conteneur de page légale : une seule colonne, largeur de lecture. */
export function LegalCorps({ children }: { children: React.ReactNode }) {
  return (
    <Section spacing="compact">
      <div className="max-w-3xl space-y-10">{children}</div>
    </Section>
  );
}
