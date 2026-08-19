import type { Metadata } from "next";
import { site, siteUrl, absoluteUrl, siteOuvertAuxMoteurs } from "@/lib/site";
import { getRoute, breadcrumbsFor } from "@/lib/routes";

/**
 * Fabrique les métadonnées d'une page à partir du registre de routes.
 *
 * Usage dans une page :
 *   export const metadata = metadataFor("/solutions/planning-interventions");
 *
 * Garantit automatiquement : title unique, meta description, canonical absolu,
 * Open Graph, Twitter Card et contrôle de l'indexabilité.
 */
export function metadataFor(path: string): Metadata {
  const route = getRoute(path);
  const url = absoluteUrl(route.path);

  return {
    title: route.title,
    description: route.description,
    alternates: { canonical: url },
    /**
     * Trois conditions cumulatives pour qu'une page soit indexable.
     *
     * 1. `siteOuvertAuxMoteurs` — tant que le site est en pré-lancement,
     *    AUCUNE page ne l'est, quelle que soit sa déclaration au registre.
     *    C'est la seconde barrière, indépendante de l'en-tête HTTP posée par
     *    le .htaccess : deux mécanismes distincts doivent tomber en même temps
     *    pour qu'une page fuie dans l'index.
     * 2. `indexable` — la page vise-t-elle une requête ? (la confirmation
     *    d'envoi, par exemple, n'a aucune valeur de recherche)
     * 3. `published` — une page peut exister sur le disque sans être publiée
     *    au registre : Next sert la route quoi qu'il arrive. Sans ce garde-fou,
     *    une page construite mais non validée resterait indexable si Google la
     *    découvrait autrement que par le sitemap.
     */
    robots:
      siteOuvertAuxMoteurs && route.indexable && route.published
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: site.locale,
      url,
      siteName: site.name,
      title: route.title,
      description: route.description,
      /**
       * ⚠️ L'image doit être déclarée ICI, explicitement.
       *
       * `src/app/opengraph-image.tsx` ne l'a posée que sur l'accueil : dès
       * qu'une page déclare son propre bloc `openGraph`, celui-ci REMPLACE
       * celui du layout au lieu de le compléter, et l'image du fichier n'y est
       * pas réinjectée. Seize pages sur dix-sept annonçaient donc une carte
       * `summary_large_image` sans image (constaté en production le
       * 18/08/2026).
       *
       * La dégradation n'est pas discrète : une carte « grande image » sans
       * image s'affiche en bloc de texte nu sur LinkedIn, WhatsApp et Slack —
       * c'est-à-dire là où les pages solutions et secteurs sont partagées en
       * prospection.
       *
       * L'URL est relative : c'est `metadataBase`, déclaré dans le layout
       * racine, qui la rend absolue. Une URL relative dans un partage social
       * ne fonctionne pas.
       */
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: site.name + " — " + site.description,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: route.title,
      description: route.description,
      // Même image qu'Open Graph : X ne retombe pas systématiquement sur
      // `og:image` lorsque `twitter:card` est déclaré.
      images: ["/opengraph-image"],
    },
  };
}

/* ==========================================================================
   DONNÉES STRUCTURÉES (Schema.org)
   Règle (cahier V2 §28) : ne jamais déclarer une information absente
   du contenu visible de la page.
   ========================================================================== */

/** Identifiants stables, pour lier les entités entre elles. */
export const schemaIds = {
  organization: `${siteUrl}/#organization`,
  website: `${siteUrl}/#website`,
} as const;

/**
 * Organization — injecté une seule fois, dans le layout racine.
 * `legalName`, `email`, `telephone`, `address` et `sameAs` ne sont ajoutés
 * que s'ils sont réellement renseignés dans src/lib/site.ts.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": schemaIds.organization,
    name: site.name,
    url: siteUrl,
    ...(site.legalName ? { legalName: site.legalName } : {}),
    ...(site.email ? { email: site.email } : {}),
    ...(site.phoneInternational
      ? { telephone: site.phoneInternational }
      : site.phone
        ? { telephone: site.phone }
        : {}),
    ...(site.address
      ? { address: { "@type": "PostalAddress", ...site.address } }
      : {}),
    ...(site.socials.length ? { sameAs: site.socials } : {}),
  };
}

/**
 * WebSite — décrit le site lui-même.
 * Pas de `SearchAction` : le site n'expose pas de moteur de recherche interne,
 * le déclarer serait une donnée structurée mensongère.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": schemaIds.website,
    url: siteUrl,
    name: site.name,
    inLanguage: site.lang,
    publisher: { "@id": schemaIds.organization },
  };
}

/** WebPage — une par page, reliée au site et à l'éditeur. */
export function webPageSchema(path: string) {
  const route = getRoute(path);
  const url = absoluteUrl(route.path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: route.title,
    description: route.description,
    inLanguage: site.lang,
    isPartOf: { "@id": schemaIds.website },
  };
}

/**
 * BreadcrumbList — dérivé du registre, jamais écrit à la main.
 *
 * ⚠️ PLUS AUCUNE PAGE N'ÉMET CE SCHÉMA DEPUIS LE 19/08/2026.
 *
 * Le fil d'Ariane visible a été retiré de toutes les pages : la barre
 * « Accueil / Secteurs » sous l'en-tête se lisait comme deux onglets inutiles.
 * Le schéma est parti avec lui, et ce n'est pas un oubli : Google interdit de
 * baliser un contenu que le visiteur ne voit pas. C'est la règle que ce fichier
 * applique déjà à `faqSchema`. La garder pour le fil d'Ariane et l'enfreindre
 * ici exposerait le site à une action manuelle pour données structurées
 * trompeuses — un prix sans rapport avec le gain.
 *
 * CE QU'ON PERD : l'affichage du chemin dans les résultats de recherche. Google
 * y substitue l'URL, déjà lisible (argon-mobility.com › solutions › planning).
 *
 * La fonction est CONSERVÉE, pas supprimée : le jour où un fil d'Ariane visible
 * revient — sous une autre forme, dans le hero par exemple — il faudra réémettre
 * ce schéma en même temps. Les deux vont ensemble, dans les deux sens.
 *
 * Le schéma n'est émis que si TOUTE la chaîne est publiée. Un fil d'Ariane
 * structuré qui pointe vers une URL en 404 est signalé comme erreur dans la
 * Search Console, et Google exige une chaîne contiguë : on ne peut pas se
 * contenter de retirer le maillon manquant.
 */
export function breadcrumbSchema(path: string) {
  const trail = breadcrumbsFor(path);
  if (trail.length < 2) return null; // pas de fil d'Ariane sur l'accueil
  if (trail.some((route) => !route.published)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((route, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: route.label,
      item: absoluteUrl(route.path),
    })),
  };
}

/**
 * FAQPage — à n'utiliser que si les questions/réponses sont réellement
 * visibles sur la page (exigence Google, et règle V2 §22).
 */
export function faqSchema(items: { question: string; answer: string }[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
