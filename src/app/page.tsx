import { Hero } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * ACCUEIL.
 *
 * État Phase 2B : Header (layout) + Hero + section « problème ».
 * Les sections 3 à 8 du cahier V2 §7 (solution, solutions, métiers, interface,
 * bénéfices, CTA final) ne sont volontairement pas construites.
 */

const PATH = "/";

export const metadata = metadataFor(PATH);

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
