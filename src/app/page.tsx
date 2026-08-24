import { Hero } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ChainSection } from "@/components/sections/ChainSection";
import { ModulesSection } from "@/components/sections/ModulesSection";
import { SectorsSection } from "@/components/sections/SectorsSection";
import { ProfondeurGrid } from "@/components/sections/depth/ProfondeurGrid";
import { TemoignageSection } from "@/components/sections/TemoignageSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { metadataFor, webPageSchema } from "@/lib/seo";

/**
 * ACCUEIL.
 *
 * État Phase 2F : la homepage est complète.
 * Hero → problème → chaîne de gestion → briques fonctionnelles → métiers →
 * profondeur → CTA final. Header et footer sont portés par le layout racine.
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
      <ProfondeurGrid />
      {/* La seule preuve exterieure du site. Placee ici, et nulle part
          ailleurs : un temoignage qui apparait sur chaque page perd sa
          force, et l accueil est la seule page que tout le monde voit. */}
      <TemoignageSection />
      <FinalCtaSection />
      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
