import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empêche un build de partir en production avec des erreurs de types
  // silencieusement ignorées. (L'option `eslint` a été retirée de la config
  // Next 16 : le lint passe désormais par `npm run lint` / `npm run check`.)
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,

  // URLs avec slash final => 301 vers la version sans slash.
  // Évite le contenu dupliqué (/solutions/ et /solutions).
  trailingSlash: false,

  async redirects() {
    return [
      /**
       * Cahier V2 §25 — table de redirections.
       *
       * Seule cette entrée est active : « intervention terrain » a été retiré
       * des secteurs (ce n'est pas un métier) et son intention est portée par
       * /solutions/gestion-interventions.
       *
       * Les autres lignes de la table V2 (geolocalisation, gestion-techniciens,
       * transport) ne sont PAS déclarées : ces URLs n'ont jamais été publiées
       * ni indexées, créer une redirection pour elles serait du bruit inutile.
       * À réactiver uniquement si Search Console remonte ces URLs.
       */
      {
        // `statusCode: 301` et non `permanent: true` : ce dernier émet un 308.
        // Google traite les deux à l'identique, mais plusieurs outils d'audit
        // et de vieux crawlers ne gèrent que le 301.
        source: "/secteurs/intervention-terrain",
        destination: "/solutions/gestion-interventions",
        statusCode: 301,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
