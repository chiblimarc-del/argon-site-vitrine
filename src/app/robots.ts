import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/site";

/**
 * robots.txt.
 *
 * Garde-fou : tant que NEXT_PUBLIC_SITE_URL ne pointe pas sur le domaine de
 * production, on interdit toute indexation. Cela évite qu'une preview
 * (Vercel, staging OVH) soit indexée et crée du contenu dupliqué.
 */
const PRODUCTION_HOST = "www.argon-mobility.com";

export default function robots(): MetadataRoute.Robots {
  const isProduction = new URL(siteUrl).host === PRODUCTION_HOST;

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
