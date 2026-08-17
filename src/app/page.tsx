import { Hero } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ChainSection } from "@/components/sections/ChainSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * ACCUEIL.
 *
 * État Phase 2C : Header (layout) + Hero + « problème » + « chaîne de gestion ».
 * Les sections suivantes (briques, métiers, interface, CTA final) ne sont
 * volontairement pas construites.
 */

const PATH = "/";

export const metadata = metadataFor(PATH);

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <ChainSection />
      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
