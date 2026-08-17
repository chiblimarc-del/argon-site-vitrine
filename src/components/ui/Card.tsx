import Link from "next/link";
import { cn } from "@/lib/cn";
import { ArrowRight } from "@/components/ui/Button";

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Ajoute un léger relief au survol. Réservé aux cartes cliquables. */
  interactive?: boolean;
}

/** Conteneur de contenu standard : surface, bordure, rayon. */
export function Card({
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "card p-6",
        interactive &&
          "transition-colors duration-200 hover:border-line hover:bg-surface-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface LinkCardProps {
  href: string;
  title: string;
  description?: string;
  /** Libellé d'action affiché en bas de carte. */
  action?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Carte entièrement cliquable, utilisée pour le maillage interne
 * (hubs Solutions et Secteurs, blocs « pages liées »).
 * Le lien couvre toute la carte via un pseudo-élément : une seule cible
 * dans l'ordre de tabulation, et un seul lien dans le HTML pour le crawl.
 */
export function LinkCard({
  href,
  title,
  description,
  action = "En savoir plus",
  icon,
  className,
}: LinkCardProps) {
  return (
    <div
      className={cn(
        "card group relative flex flex-col p-6",
        "transition-colors duration-200 hover:border-accent/40 hover:bg-surface-2",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface-2 text-cyan">
          {icon}
        </div>
      ) : null}

      <h3 className="text-base font-semibold text-ink">
        <Link href={href} className="after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </h3>

      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
      ) : null}

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text">
        {action}
        <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </div>
  );
}
