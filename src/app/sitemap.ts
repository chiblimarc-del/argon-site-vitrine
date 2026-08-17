import type { MetadataRoute } from "next";
import { publishedRoutes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

/**
 * ⚠️ `dynamic = "force-static"` est OBLIGATOIRE avec `output: "export"` :
 * sans lui, le build échoue sur cette route. Il déclare explicitement que le
 * fichier est calculé une fois au build, jamais à la requête.
 */
export const dynamic = "force-static";


/**
 * Sitemap généré depuis le registre de routes.
 *
 * Seules les routes `published: true` ET `indexable: true` y figurent :
 * il est donc structurellement impossible de déclarer à Google une page
 * qui n'existe pas encore. Publier une page = basculer son drapeau
 * `published` dans src/lib/routes.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publishedRoutes().map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.sitemapPriority,
  }));
}
