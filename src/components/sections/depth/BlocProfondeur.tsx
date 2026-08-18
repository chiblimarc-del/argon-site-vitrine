import { Section, SectionHeading } from "@/components/ui/Section";
import { NavLink } from "@/components/navigation/NavLink";
import { ArrowRight } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * GABARIT DES BLOCS DE PROFONDEUR (lot 1).
 *
 * Six emplacements, toujours dans cet ordre :
 *   1. éveil      — surtitre, nomme le territoire, jamais la fonction
 *   2. promesse   — H2, un résultat pour le dirigeant
 *   3. bénéfice   — chapô, ce que ça change
 *   4. preuve     — EXACTEMENT trois lignes
 *   5. frontière  — ce que le bloc ne fait pas
 *   6. passerelle — un lien contextuel, facultatif
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DU LOT — ANTI-CATALOGUE
 *
 * Un bloc n'énumère pas des fonctions : il porte une promesse, la traduit en
 * bénéfice, et l'appuie sur une preuve. Les fonctionnalités n'apparaissent
 * qu'au service de la promesse, jamais comme sujet.
 *
 * Le tuple `preuves` est de longueur trois, et c'est volontaire : une
 * quatrième ligne ne compile pas. La règle de trois est la seule chose qui
 * empêche ces blocs de redevenir des listes de fonctionnalités, et une règle
 * qu'on peut contourner par distraction n'est pas une règle.
 *
 * L'emplacement `frontiere` est OBLIGATOIRE pour la même raison : un bloc qui
 * nomme sa limite ne peut pas prétendre tout couvrir. C'est le registre du
 * site depuis « une facturation d'exploitation, pas une comptabilité ».
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Server Component, zéro JavaScript client.
 */

export type Preuve = {
  /** Titre de la ligne. Un fait produit, pas un nom de module. */
  titre: string;
  /** Sa conséquence pour le dirigeant. */
  texte: React.ReactNode;
};

/** Trois preuves. Ni deux, ni quatre — cf. règle du lot. */
export type TroisPreuves = readonly [Preuve, Preuve, Preuve];

export type Passerelle = {
  href: string;
  libelle: string;
};

interface BlocProfondeurProps {
  eyebrow: string;
  titre: React.ReactNode;
  chapo: React.ReactNode;
  preuves: TroisPreuves;
  /** Obligatoire : ce que le bloc ne fait pas. */
  frontiere: React.ReactNode;
  passerelle?: Passerelle;
  tone?: "canvas" | "alt";
  /**
   * `grille` (défaut) : le gabarit affiche lui-même les trois preuves.
   * `personnalise` : le bloc les rend dans `children`, à sa façon. Le tuple
   * reste exigé dans les deux cas — c'est le contrat éditorial, pas un
   * détail d'affichage.
   */
  renduPreuves?: "grille" | "personnalise";
  /** Contenu inséré entre le chapô et la frontière. */
  children?: React.ReactNode;
  className?: string;
}

export function BlocProfondeur({
  eyebrow,
  titre,
  chapo,
  preuves,
  frontiere,
  passerelle,
  tone = "canvas",
  renduPreuves = "grille",
  children,
  className,
}: BlocProfondeurProps) {
  return (
    <Section
      tone={tone}
      containerWidth="wide"
      className={cn("border-b border-line-soft", className)}
    >
      <SectionHeading
        as="h2"
        eyebrow={eyebrow}
        title={titre}
        description={chapo}
        className="max-w-3xl"
      />

      {children}

      {renduPreuves === "grille" ? (
        <ul className="mt-14 grid gap-5 sm:grid-cols-3">
          {preuves.map((preuve) => (
            <li key={preuve.titre} className="card flex flex-col p-6">
              <h3 className="text-[15px] font-semibold text-ink">
                {preuve.titre}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {preuve.texte}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <Frontiere>{frontiere}</Frontiere>

      {passerelle ? (
        <p className="mt-8">
          <NavLink
            href={passerelle.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-text"
          >
            {passerelle.libelle}
            <ArrowRight />
          </NavLink>
        </p>
      ) : null}
    </Section>
  );
}

/**
 * La frontière. Traitée comme une note, pas comme un argument : filet vertical
 * discret, texte légèrement en retrait. Elle doit se lire comme une précision
 * honnête, jamais comme une mise en garde.
 */
export function Frontiere({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-10 max-w-3xl border-l-2 border-line pl-5 text-[14.5px] leading-relaxed text-ink-soft">
      {children}
    </p>
  );
}
