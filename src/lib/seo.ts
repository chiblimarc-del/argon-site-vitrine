import type { Metadata } from "next";
import { site, siteUrl, absoluteUrl } from "@/lib/site";
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
    robots: route.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: site.locale,
      url,
      siteName: site.name,
      title: route.title,
      description: route.description,
    },
    twitter: {
      card: "summary_large_image",
      title: route.title,
      description: route.description,
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
    ...(site.phone ? { telephone: site.phone } : {}),
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

/** BreadcrumbList — dérivé du registre, jamais écrit à la main. */
export function breadcrumbSchema(path: string) {
  const trail = breadcrumbsFor(path);
  if (trail.length < 2) return null; // pas de fil d'Ariane sur l'accueil
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
