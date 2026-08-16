import Link from "next/link";
import { cn } from "@/lib/cn";
import { findRoute } from "@/lib/routes";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Lien de navigation piloté par le registre de routes.
 *
 * Si la route n'est pas encore `published`, on rend un <span> inerte plutôt
 * qu'un lien : le site ne contient donc jamais de lien mort, même pendant
 * les phases de construction. Le jour où la page est créée, on bascule
 * `published: true` dans src/lib/routes.ts et le lien s'active partout.
 */
export function NavLink({ href, children, className }: NavLinkProps) {
  const route = findRoute(href);
  const isPublished = route?.published ?? true;

  if (!isPublished) {
    return (
      <span
        className={cn("cursor-default text-ink-muted", className)}
        title="Page en cours de construction"
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
