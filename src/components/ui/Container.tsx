import { cn } from "@/lib/cn";

type ContainerWidth = "default" | "narrow" | "wide";

const widths: Record<ContainerWidth, string> = {
  /** Lecture confortable : pages éditoriales, texte long. */
  narrow: "max-w-3xl",
  /** Largeur standard du site. */
  default: "max-w-7xl",
  /** Sections qui montrent une interface produit large. */
  wide: "max-w-[88rem]",
};

interface ContainerProps extends React.ComponentPropsWithoutRef<"div"> {
  width?: ContainerWidth;
}

/**
 * Gouttière horizontale unique du site.
 * Toute section doit passer par ce composant : c'est ce qui garantit
 * l'alignement vertical parfait entre le header, le contenu et le footer.
 */
export function Container({
  width = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-10",
        widths[width],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
