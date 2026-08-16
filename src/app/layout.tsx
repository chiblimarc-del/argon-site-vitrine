import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { site, siteUrl } from "@/lib/site";

/**
 * Inter, en fichier variable auto-hébergé (src/fonts/).
 *
 * Volontairement `next/font/local` et non `next/font/google` : le fichier est
 * versionné dans le dépôt, donc le build ne dépend d'aucun appel réseau vers
 * fonts.googleapis.com. Build reproductible, aucune requête tierce côté
 * visiteur, et rien à déclarer au titre du RGPD.
 *
 * Un seul fichier variable couvre toutes les graisses de 100 à 900 : ~48 ko.
 */
const inter = localFont({
  src: [
    {
      path: "../fonts/inter-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

/**
 * Métadonnées héritées par toutes les pages.
 * `metadataBase` rend absolues les URLs relatives (canonical, Open Graph).
 * `title.template` évite de répéter la marque dans chaque page.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Logiciel de gestion des interventions terrain | Argon",
    template: "%s",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#050818",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={site.lang} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        {/* Accessibilité : permet de sauter la navigation au clavier. */}
        <a
          href="#contenu"
          className="sr-only-focusable absolute left-4 top-4 z-[60] rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Aller au contenu
        </a>

        <Header />

        <main id="contenu" className="flex-1">
          {children}
        </main>

        <Footer />

        {/* Entités globales, injectées une seule fois pour tout le site. */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
