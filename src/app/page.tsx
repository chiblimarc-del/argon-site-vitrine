import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { metadataFor, webPageSchema } from "@/lib/seo";
import { getRoute } from "@/lib/routes";

/**
 * ACCUEIL — SQUELETTE UNIQUEMENT.
 *
 * ⚠️ Le hero et les sections de la homepage ne sont volontairement PAS
 * construits à ce stade (fin de Phase 1 : fondations seules).
 * Cette page ne sert qu'à valider la chaîne complète :
 * registre de routes → métadonnées → canonical → JSON-LD → layout.
 *
 * La construction des sections 1 à 8 du cahier V2 §7 se fera à l'étape
 * suivante, dans src/components/sections/.
 */

const PATH = "/";

export const metadata = metadataFor(PATH);

export default function HomePage() {
  const route = getRoute(PATH);

  return (
    <>
      <Section spacing="large">
        <SectionHeading as="h1" title={route.h1} />
      </Section>

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
