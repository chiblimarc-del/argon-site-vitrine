import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { DemoForm } from "@/components/forms/DemoForm";
import { metadataFor, webPageSchema } from "@/lib/seo";
import { getRoute } from "@/lib/routes";

/**
 * PAGE DE CONVERSION — demande de démonstration.
 *
 * Volontairement dépouillée : ni maquette produit, ni argumentaire, ni rappel
 * des fonctionnalités. Le visiteur qui arrive ici a déjà décidé ; tout ce qui
 * s'ajouterait entre lui et le bouton lui coûterait.
 *
 * RÈGLE DE VÉRITÉ (cahier V2 §31) : aucun délai de rappel promis, aucune durée
 * d'essai, aucune gratuité, aucune mention « sans engagement ». Rien de tout
 * cela n'est validé, et un engagement écrit ici se paie en démonstration.
 */

const PATH = "/demander-une-demo";

export const metadata = metadataFor(PATH);

/** Ce qui attend le visiteur. Décrit un déroulé, ne promet aucun délai. */
const etapes = [
  {
    titre: "Vous décrivez votre activité",
    detail:
      "Vos métiers, votre volume d'interventions, la façon dont vous travaillez aujourd'hui.",
  },
  {
    titre: "Nous montrons Argon sur vos cas",
    detail:
      "Pas une démonstration générique : vos types de missions, votre organisation.",
  },
  {
    titre: "Vous décidez",
    detail:
      "Vous voyez ce que la plateforme couvre, et ce qu'elle ne couvre pas encore.",
  },
];

export default function DemanderUneDemoPage() {
  const route = getRoute(PATH);

  return (
    <>
      <Container width="wide">
        <div className="grid gap-12 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-16 lg:py-24">
          {/* ---------- Colonne éditoriale ---------- */}
          <div className="max-w-lg">
            <h1 className="text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
              {route.h1}
            </h1>

            <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
              Une demande, un devis, une intervention, une facture : voyez
              comment Argon enchaîne ces étapes pour une entreprise comme la
              vôtre.
            </p>

            <ol className="mt-12 space-y-7">
              {etapes.map((etape, index) => (
                <li key={etape.titre} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[12px] font-medium text-ink-soft"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-ink">
                      {etape.titre}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
                      {etape.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* ---------- Formulaire ---------- */}
          <div className="min-w-0">
            <DemoForm />
          </div>
        </div>
      </Container>

      <JsonLd data={webPageSchema(PATH)} />
    </>
  );
}
