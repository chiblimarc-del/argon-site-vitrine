import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";

type SectionTone = "canvas" | "alt";
type SectionSpacing = "default" | "compact" | "large";

const tones: Record<SectionTone, string> = {
  canvas: "bg-canvas",
  /** Bande alternée, pour rythmer la page sans ajouter de bordures. */
  alt: "bg-canvas-2",
};

const spacings: Record<SectionSpacing, string> = {
  compact: "py-14 sm:py-16",
  default: "py-20 sm:py-24 lg:py-28",
  large: "py-24 sm:py-32 lg:py-36",
};

interface SectionProps extends React.ComponentPropsWithoutRef<"section"> {
  tone?: SectionTone;
  spacing?: SectionSpacing;
  containerWidth?: React.ComponentProps<typeof Container>["width"];
  /** Désactive le Container interne, pour une section qui gère sa propre grille. */
  bleed?: boolean;
}

/**
 * Bloc de page standard : gère l'espacement vertical, le fond et la gouttière.
 * Le `relative` permet de positionner des halos décoratifs sans casser le flux.
 */
export function Section({
  tone = "canvas",
  spacing = "default",
  containerWidth = "default",
  bleed = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("relative overflow-hidden", tones[tone], spacings[spacing], className)}
      {...props}
    >
      {bleed ? (
        children
      ) : (
        <Container width={containerWidth} className="relative z-10">
          {children}
        </Container>
      )}
    </section>
  );
}

interface SectionHeadingProps {
  /** Surtitre court. Décoratif : ne remplace jamais un niveau de titre. */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Niveau de titre réel. `h1` est réservé à un seul élément par page. */
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  className?: string;
}

const titleSizes = {
  h1: "text-4xl sm:text-5xl lg:text-6xl font-semibold",
  h2: "text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold",
  h3: "text-2xl sm:text-3xl font-semibold",
} as const;

/** En-tête de section : surtitre, titre, chapô. Hiérarchie Hn explicite. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Tag = "h2",
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <Tag className={cn(titleSizes[Tag], "leading-[1.1] text-ink")}>{title}</Tag>
      {description ? (
        <p className="mt-5 text-base sm:text-lg leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Étiquette de surtitre. Purement visuelle. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-surface px-3 py-1",
        "text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}
