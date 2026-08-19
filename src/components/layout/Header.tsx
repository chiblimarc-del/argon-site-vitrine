import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { TelephoneLink } from "@/components/navigation/TelephoneLink";
import { EspaceClient } from "@/components/navigation/EspaceClient";

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

          {/*
            À DROITE : appeler, ou se connecter. Plus de « Demander une démo »
            ici depuis le 19/08/2026 — l'accueil ouvre déjà dessus, en pleine
            page, et le CTA ferme chaque page intérieure. Le répéter dans la
            barre le diluait. Voir la note dans EspaceClient.
          */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/*
              Le masquage responsive passe par un conteneur, jamais par une
              classe `hidden` posée sur un composant qui applique déjà
              `inline-flex` : sans tailwind-merge c'est l'ordre du CSS généré
              qui tranche, pas l'ordre des classes. Règle du projet : on ne
              surcharge pas une utilitaire `display` d'un composant depuis
              l'extérieur, on l'enveloppe.
            */}
            <div className="hidden md:block">
              <TelephoneLink />
            </div>
            <div className="hidden sm:block">
              <EspaceClient />
            </div>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}
