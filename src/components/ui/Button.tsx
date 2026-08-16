import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-colors duration-200 whitespace-nowrap " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  /** CTA unique du site : « Demander une démo ». */
  primary: "bg-accent text-white hover:bg-accent-hover",
  /** Action secondaire, sur fond sombre. */
  secondary:
    "border border-line bg-surface text-ink hover:bg-surface-2 hover:border-line",
  /** Lien d'action discret, sans fond. */
  ghost: "text-ink-soft hover:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<React.ComponentPropsWithoutRef<"button">, "className" | "children">;

/**
 * Bouton unique du site. Rend un <Link> si `href` est fourni, sinon un <button>.
 * Aucune variante « danger » ou « success » : ce sont des couleurs d'état
 * réservées à l'interface produit, pas à la vitrine.
 */
function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button(props: ButtonAsLink | ButtonAsButton) {
  if (props.href !== undefined) {
    const { href, variant = "primary", size = "md", className, children, ...rest } =
      props;
    return (
      <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant = "primary",
    size = "md",
    className,
    children,
    href: _href,
    ...rest
  } = props;
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

/** Flèche décorative des CTA. Masquée aux lecteurs d'écran. */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
    >
      <path
        d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
