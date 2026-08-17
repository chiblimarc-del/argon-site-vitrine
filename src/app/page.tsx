import { Hero } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ChainSection } from "@/components/sections/ChainSection";
import { ModulesSection } from "@/components/sections/ModulesSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * ACCUEIL.
 *
 * État Phase 2D : Header (layout) + Hero + « problème » + « chaîne de gestion »
 * + « briques fonctionnelles ».
 * Les sections suivantes (métiers, CTA final) ne sont volontairement pas
 * construites.
 */

const PATH = "/";

export const metadata = metadataFor(PATH);

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <ChainSection />
      <ModulesSection />
      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
