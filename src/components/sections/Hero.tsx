import { Container } from "@/components/ui/Container";
import { Button, ArrowRight } from "@/components/ui/Button";
import { AppPreview } from "@/components/product-ui/AppPreview";
import { primaryCta, secondaryCta } from "@/lib/site";
import { findRoute, getRoute, secteurRoutes } from "@/lib/routes";

/**
 * HERO de la page d'accueil.
 *
 * ⚠️ LE H1 EST LU AU REGISTRE, il n'est plus écrit ici.
 * Il l'était, en double avec `routes.ts`, et c'était l'unique exception du
 * site : `seo:check` ne lit aucun fichier de page, une divergence entre les
 * deux serait donc passée inaperçue. Le dégradé — qui était la raison de la
 * duplication — s'applique désormais à un segment repéré DANS la chaîne du
 * registre, sans la recopier.
 *
 * Pour changer le H1 : modifier `routes.ts`, et rien d'autre. Si le segment
 * accentué n'existe plus dans la nouvelle phrase, le titre s'affiche en entier
 * sans dégradé — dégradation visible, jamais un titre faux.
 *
 * Aucune preuve commerciale fabriquée (V2 §31) : pas de logo client, pas de
 * témoignage, pas de chiffre d'affaires, pas d'essai gratuit. La bande basse
 * énonce les métiers visés — un positionnement, pas une liste de références.
 *
 * Server Component, zéro JavaScript côté client, aucune image à charger.
 */

const H1_ACCUEIL = getRoute("/").h1;

/**
 * Le fragment du H1 qui porte le dégradé de marque.
 * Il doit exister mot pour mot dans `getRoute("/").h1`. S'il n'y est pas, le
 * titre s'affiche en entier sans dégradé — on perd un effet, jamais du sens.
 */
const SEGMENT_ACCENTUE = "Saisi une fois.";

export function Hero() {
  /**
   * Le CTA secondaire ne s'affiche que si sa destination est publiée au
   * registre. `/solutions` ne l'est pas encore : sans ce garde-fou, le Hero
   * affichait un bouton menant à une 404 — le contrôle de maillage l'a révélé.
   * Il réapparaîtra de lui-même le jour où le hub sera construit.
   */
  const secondaireDisponible = findRoute(secondaryCta.href)?.published ?? false;

  /* Le titre vient du registre. Le segment accentué est repéré dedans, jamais
     recopié : impossible d'afficher autre chose que ce que Google recevra. */
  const avecAccent = H1_ACCUEIL.includes(SEGMENT_ACCENTUE);
  const [avantAccent, apresAccent] = avecAccent
    ? [
        H1_ACCUEIL.slice(0, H1_ACCUEIL.indexOf(SEGMENT_ACCENTUE)),
        H1_ACCUEIL.slice(
          H1_ACCUEIL.indexOf(SEGMENT_ACCENTUE) + SEGMENT_ACCENTUE.length,
        ),
      ]
    : [H1_ACCUEIL, ""];

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
              {avantAccent}
              {avecAccent && (
                <span className="text-gradient">{SEGMENT_ACCENTUE}</span>
              )}
              {apresAccent}
            </h1>

            <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
              La demande, le devis, l&apos;intervention, le compte rendu et la
              facture sont le même dossier, vu à cinq moments. Personne ne
              recopie ce que quelqu&apos;un d&apos;autre a déjà saisi.
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
