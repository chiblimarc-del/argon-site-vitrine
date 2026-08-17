import { Hero } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ChainSection } from "@/components/sections/ChainSection";
import { ModulesSection } from "@/components/sections/ModulesSection";
import { SectorsSection } from "@/components/sections/SectorsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * ACCUEIL.
 *
 * État Phase 2E : Header (layout) + Hero + « problème » + « chaîne de gestion »
 * + « briques fonctionnelles » + « métiers ».
 * La section finale (CTA) n'est volontairement pas construite.
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
      <SectorsSection />
      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
