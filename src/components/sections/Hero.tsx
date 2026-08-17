import { Container } from "@/components/ui/Container";
import { Button, ArrowRight } from "@/components/ui/Button";
import { AppPreview } from "@/components/product-ui/AppPreview";
import { primaryCta, secondaryCta } from "@/lib/site";
import { findRoute, secteurRoutes } from "@/lib/routes";

/**
 * HERO de la page d'accueil.
 *
 * Le H1 et l'accroche sont ceux du cahier V2 §5 et du registre de routes
 * (`getRoute("/").h1`). Ils sont écrits littéralement ici parce que le mot-clé
 * « opérations terrain » porte un dégradé : le rendu exige du balisage, pas une
 * chaîne. Toute modification doit être répercutée dans src/lib/routes.ts.
 *
 * Aucune preuve commerciale fabriquée (V2 §31) : pas de logo client, pas de
 * témoignage, pas de chiffre d'affaires, pas d'essai gratuit. La bande basse
 * énonce les métiers visés — un positionnement, pas une liste de références.
 *
 * Server Component, zéro JavaScript côté client, aucune image à charger.
 */
export function Hero() {
  /**
   * Le CTA secondaire ne s'affiche que si sa destination est publiée au
   * registre. `/solutions` ne l'est pas encore : sans ce garde-fou, le Hero
   * affichait un bouton menant à une 404 — le contrôle de maillage l'a révélé.
   * Il réapparaîtra de lui-même le jour où le hub sera construit.
   */
  const secondaireDisponible = findRoute(secondaryCta.href)?.published ?? false;

  return (
    <section className="relative overflow-hidden border-b border-line-soft">
      {/* Décor de fond — purement visuel, hors du flux et non annoncé. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="grid-bg absolute inset-0" />
        <div className="glow left-[-10%] top-[-18%] h-[380px] w-[380px] bg-accent/18" />
        <div className="glow right-[-8%] top-[6%] h-[420px] w-[420px] bg-accent-2/12" />
      </div>

      <Container width="wide" className="relative z-10">
        <div className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-24 xl:gap-20">
          {/* ---------- Colonne texte ---------- */}
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-argon" />
              Logiciel de gestion des interventions
            </p>

            <h1 className="mt-6 text-[2.4rem] font-semibold leading-[1.08] text-ink sm:text-5xl xl:text-[3.4rem]">
              Pilotez vos{" "}
              <span className="text-gradient">opérations terrain</span>{" "}
              depuis une seule plateforme.
            </h1>

            <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
              Interventions, planning, équipes, missions et suivi terrain :
              Argon centralise votre activité opérationnelle.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
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

            {/*
              À la place d'une bande de logos clients (interdite tant qu'aucun
              client n'est référençable) : les métiers réellement adressés,
              lus depuis le registre de routes.
            */}
            <div className="mt-12 border-t border-line-soft pt-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                Conçu pour les entreprises qui travaillent sur le terrain
              </p>
              <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                {secteurRoutes.map((secteur) => (
                  <li
                    key={secteur.path}
                    className="text-sm font-medium text-ink-soft"
                  >
                    {secteur.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---------- Colonne interface ---------- */}
          <div className="relative min-w-0">
            <AppPreview />
          </div>
        </div>
      </Container>

    </section>
  );
}
