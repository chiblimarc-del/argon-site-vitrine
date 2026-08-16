import { Hero } from "@/components/sections/Hero";
import { JsonLd } from "@/components/seo/JsonLd";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * ACCUEIL.
 *
 * État Phase 2A : Header (layout) + Hero uniquement.
 * Les sections 2 à 8 du cahier V2 §7 (problème, solution, solutions, métiers,
 * interface, bénéfices, CTA final) ne sont volontairement pas construites.
 */

const PATH = "/";

export const metadata = metadataFor(PATH);

export default function HomePage() {
  return (
    <>
      <Hero />
      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
