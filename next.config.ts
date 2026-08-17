import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * ═══════════════════════════════════════════════════════════════════════
   * EXPORT STATIQUE — décision de déploiement, août 2026
   *
   * `next build` produit un dossier `out/` de HTML, CSS et JS purs, déposé
   * tel quel sur l'hébergement mutualisé OVH. Aucun processus Node ne tourne
   * en production.
   *
   * Pourquoi : l'hébergement mutualisé OVH classique n'exécute que PHP, et la
   * version de Node.js de l'offre Cloud Web n'est pas documentée (les guides
   * officiels citent encore Node 8, quand Next 16 exige Node ≥ 20.9). Or les
   * 16 pages étaient déjà toutes pré-générées : le seul élément qui réclamait
   * un serveur était le formulaire, désormais traité par `api/demande.php`.
   *
   * ⚠️ CE QUE CELA INTERDIT DÉFINITIVEMENT dans ce projet :
   *   — les actions serveur (`"use server"`) ;
   *   — les Route Handlers autres que GET statique ;
   *   — `redirects()` et `headers()` ci-dessous, qui ne sont pas appliqués en
   *     export : ils ont été transposés dans `deploy/.htaccess`, qui est
   *     désormais leur unique source. Toute règle ajoutée ici serait
   *     silencieusement ignorée en production.
   *   — `next/image` avec optimisation à la demande (le site n'utilise
   *     aucune image bitmap, le point est théorique).
   * ═══════════════════════════════════════════════════════════════════════
   */
  output: "export",

  // Empêche un build de partir en production avec des erreurs de types
  // silencieusement ignorées. (L'option `eslint` a été retirée de la config
  // Next 16 : le lint passe désormais par `npm run lint` / `npm run check`.)
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,

  /**
   * URLs sans slash final, identiques aux balises canonical déjà en place.
   * L'export produit alors `contact.html` plutôt que `contact/index.html` ;
   * c'est `.htaccess` qui sert le fichier sur l'URL sans extension.
   */
  trailingSlash: false,
};

export default nextConfig;
