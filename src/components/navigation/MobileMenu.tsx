"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "@/components/navigation/NavLink";
import { Button, ArrowRight } from "@/components/ui/Button";
import { primaryCta } from "@/lib/site";
import { solutionRoutes, secteurRoutes } from "@/lib/routes";

/**
 * Menu mobile — seul composant client du header.
 * Gère l'ouverture, la fermeture par Échap et le verrouillage du défilement.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Le panneau est monté dans <body> via un portail : le header applique un
  // `backdrop-blur`, ce qui en ferait sinon le bloc conteneur des éléments
  // `fixed` et écraserait le panneau à la hauteur du header.
  // Pas de garde « mounted » nécessaire : `open` ne peut devenir vrai qu'après
  // un clic, donc jamais pendant le rendu serveur.

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    // Empêche la page de défiler derrière le panneau ouvert.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:bg-surface-2"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
          {open ? (
            <path
              d="M5 5l10 10M15 5L5 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M3 6h14M3 10h14M3 14h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open
        ? createPortal(
        <div
          id="menu-mobile"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-canvas px-5 pb-10 pt-6"
        >
          <nav aria-label="Navigation mobile">
            <MobileGroup title="Solutions" hubPath="/solutions" items={solutionRoutes} />
            <MobileGroup title="Secteurs" hubPath="/secteurs" items={secteurRoutes} />

            <ul className="mt-8 space-y-1 border-t border-line-soft pt-6">
              <li>
                <NavLink
                  href="/fonctionnalites"
                  className="block py-2.5 text-base text-ink"
                >
                  Fonctionnalités
                </NavLink>
              </li>
              <li>
                <NavLink href="/a-propos" className="block py-2.5 text-base text-ink">
                  À propos
                </NavLink>
              </li>
              <li>
                <NavLink href="/contact" className="block py-2.5 text-base text-ink">
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="mt-8">
            <Button
              href={primaryCta.href}
              size="lg"
              prefetch={false}
              className="w-full"
            >
              {primaryCta.label}
              <ArrowRight />
            </Button>
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function MobileGroup({
  title,
  hubPath,
  items,
}: {
  title: string;
  hubPath: string;
  items: typeof solutionRoutes;
}) {
  return (
    <div className="mb-7">
      <NavLink
        href={hubPath}
        className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted"
      >
        {title}
      </NavLink>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.path}>
            <NavLink href={item.path} className="block py-2.5 text-base text-ink">
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
