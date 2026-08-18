import { Section } from "@/components/ui/Section";
import { NavLink } from "@/components/navigation/NavLink";

/**
 * BLOC 6 — LA PROFONDEUR, SUR L'ACCUEIL.
 * Entre les métiers et le CTA final.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI CE N'EST PAS UNE GRILLE DE CARTES
 *
 * Quatre cartes alignées se lisent comme quatre modules indépendants — soit
 * exactement le message inverse de celui du site. C'est le seul endroit du lot
 * où la FORME peut trahir le FOND.
 *
 * D'où le parti pris : quatre STATIONS sur une même ligne continue. Le filet
 * horizontal est le même vocabulaire graphique que les liaisons continues de
 * la chaîne de gestion (ChainSection) — le lecteur ne voit pas quatre
 * fonctions, il voit quatre prolongements de la même information.
 *
 * Sur petit écran, la ligne bascule à la verticale et RESTE CONTINUE : rien ne
 * se détache, jamais. Un empilement de cartes en mobile annulerait tout le
 * travail fait en grand écran.
 *
 * DEUX DISPOSITIONS, PAS TROIS — corrigé au contrôle UX du 18/08/2026.
 * La bascule se fait à `lg`, jamais à `sm`. Une disposition intermédiaire à
 * deux colonnes plaçait le filet horizontal sur la seule première rangée :
 * « Pilotage » et « Équipes » se retrouvaient sous la ligne, pastilles
 * détachées, sans rien qui les relie. Entre 640 et 1023 px, la chaîne était
 * donc rompue exactement là où ce composant existe pour ne pas l'être.
 *
 * Dessiner un second filet sous la deuxième rangée aurait « réparé » l'image
 * en disant autre chose : deux groupes de deux. La verticale continue est
 * plus haute, et elle est vraie.
 *
 * Aucune icône, aucun encadré autonome, aucun décompte. Le trait fait le
 * travail que la prose ferait trop lourdement.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Server Component, zéro JavaScript client, aucune image.
 */

type Porte = {
  titre: string;
  texte: string;
  /** Page qui porte le bloc détaillé correspondant. */
  href: string;
};

/**
 * Quatre portes. Encaissement et documents sont réunis volontairement : une
 * cinquième station recréerait la grille de modules que cette mise en forme
 * existe pour éviter.
 */
const portes: Porte[] = [
  {
    titre: "Encaissement & documents",
    texte: "Ce qui rentre, ce qui part au comptable.",
    href: "/solutions/devis-facturation",
  },
  {
    titre: "Engagements",
    texte: "Ce qui est engagé, avant que la facture arrive.",
    href: "/solutions/gestion-interventions",
  },
  {
    titre: "Pilotage",
    texte: "Ce qui attend, ce qui bloque, ce qui est rentré.",
    href: "/solutions/gestion-interventions",
  },
  {
    titre: "Équipes",
    texte: "Les heures et les absences, dans le même planning.",
    href: "/solutions/planning-interventions",
  },
];

export function ProfondeurGrid() {
  return (
    <Section tone="alt" containerWidth="wide" className="border-b border-line-soft">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-semibold leading-[1.1] text-ink sm:text-4xl lg:text-[2.75rem]">
          Et quand l&apos;intervention est terminée ?{" "}
          <span className="text-gradient">Argon continue</span>.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
          Ce qui a été fait sur le terrain continue de servir, bien après le
          compte rendu.
        </p>
      </div>

      {/*
        La ligne continue. En grand écran elle est horizontale et traverse les
        quatre stations ; en petit écran elle devient verticale et longe la
        colonne. Dans les deux cas elle ne s'interrompt jamais entre deux
        portes — c'est tout l'argument.
      */}
      <div className="relative mt-14">
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-[5px] top-2 w-px bg-line lg:bottom-auto lg:left-0 lg:right-0 lg:top-[5px] lg:h-px lg:w-auto"
        />

        <ul className="relative grid gap-10 lg:grid-cols-4 lg:gap-x-8">
          {portes.map((porte) => (
            <li key={porte.titre} className="relative pl-8 lg:pl-0 lg:pt-8">
              <span
                aria-hidden="true"
                className="absolute left-0 top-[7px] h-[11px] w-[11px] rounded-full border-2 border-canvas-2 bg-accent lg:top-0"
              />
              <h3 className="text-[15px] font-semibold text-ink">
                <NavLink href={porte.href} className="hover:text-accent-text">
                  {porte.titre}
                </NavLink>
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                {porte.texte}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-14 max-w-3xl text-lg font-medium leading-snug text-ink sm:text-xl">
        Une information née sur le terrain n&apos;a aucune raison de
        s&apos;arrêter à la facture.
      </p>
    </Section>
  );
}
