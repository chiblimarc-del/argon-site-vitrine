import { Container } from "@/components/ui/Container";
import { Button, ArrowRight } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { primaryCta } from "@/lib/site";

/**
 * En-tête du site. Server Component : seul le menu mobile embarque du JS.
 * Collant en haut de page, avec un fond translucide flouté pour rester
 * lisible au-dessus des sections sombres.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-canvas/85 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo />

          <DesktopNav className="hidden lg:flex" />

          <div className="flex items-center gap-3">
            {/*
              Le masquage responsive passe par un conteneur, jamais par une
              classe `hidden` posée sur <Button> : le composant applique déjà
              `inline-flex`, et sans tailwind-merge c'est l'ordre du CSS généré
              qui tranche, pas l'ordre des classes. Règle du projet : on ne
              surcharge pas une utilitaire `display` d'un composant depuis
              l'extérieur, on l'enveloppe.
            */}
            <div className="hidden sm:block">
              <Button href={primaryCta.href} size="md">
                {primaryCta.label}
                <ArrowRight />
              </Button>
            </div>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}
