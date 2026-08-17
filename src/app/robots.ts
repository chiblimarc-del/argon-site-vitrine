import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl, siteOuvertAuxMoteurs } from "@/lib/site";

/**
 * ⚠️ `dynamic = "force-static"` est OBLIGATOIRE avec `output: "export"` :
 * sans lui, le build échoue sur cette route. Il déclare explicitement que le
 * fichier est calculé une fois au build, jamais à la requête.
 */
export const dynamic = "force-static";

/**
 * robots.txt — deux garde-fous indépendants.
 *
 * 1. MAUVAIS DOMAINE (preview, staging, localhost) ⇒ `Disallow: /`.
 *    Ici l'interdiction d'explorer est le bon outil : ces environnements ne
 *    doivent recevoir aucune visite de robot, et personne n'en partage l'URL.
 *
 * 2. BON DOMAINE MAIS SITE FERMÉ (phase de pré-lancement) ⇒ on AUTORISE
 *    l'exploration. Ce n'est pas une négligence, c'est la condition pour que
 *    le robot lise le `noindex` que portent l'en-tête HTTP et chaque page.
 *    Un `Disallow` ici serait contre-productif : il empêcherait Google de
 *    prendre connaissance de l'interdiction d'indexer.
 *    Le sitemap n'est pas annoncé tant que le site est fermé — inutile de
 *    proposer une liste de pages qu'on demande de ne pas indexer.
 */
const PRODUCTION_HOST = "www.argon-mobility.com";

export default function robots(): MetadataRoute.Robots {
  const surLeBonDomaine = new URL(siteUrl).host === PRODUCTION_HOST;

  if (!surLeBonDomaine) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  if (!siteOuvertAuxMoteurs) {
    return {
      rules: { userAgent: "*", allow: "/" },
      host: siteUrl,
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
