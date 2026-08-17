import { Container } from "@/components/ui/Container";
import { Button, ArrowRight } from "@/components/ui/Button";
import { NavLink } from "@/components/navigation/NavLink";
import { metadataFor } from "@/lib/seo";
import { getRoute } from "@/lib/routes";

/**
 * CONFIRMATION D'ENVOI — page technique, pas une page du site.
 *
 * On n'y arrive qu'en postant le formulaire : `api/demande.php` y redirige en
 * 303 après un envoi réussi. Le 303 garantit qu'un rechargement ne renvoie
 * pas la demande une seconde fois.
 *
 * Pourquoi une page plutôt qu'un message affiché sur place : le site est
 * statique, il n'y a aucun serveur pour re-rendre /demander-une-demo dans son
 * état « envoyé ». Faire la bascule en JavaScript marcherait pour presque
 * tout le monde — mais le formulaire, lui, fonctionne sans JavaScript, et un
 * visiteur qui l'utilise ainsi verrait le formulaire vide réapparaître sans
 * savoir si sa demande est partie. Un fichier HTML déjà construit répond dans
 * tous les cas.
 *
 * `indexable: false` au registre ⇒ noindex et absence du sitemap.
 * Aucun fil d'Ariane, aucune donnée structurée : cette page n'existe pas pour
 * les moteurs.
 */

const PATH = "/demande-envoyee";

export const metadata = metadataFor(PATH);

export default function DemandeEnvoyeePage() {
  const route = getRoute(PATH);

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="grid-bg absolute inset-0" />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-lg py-20 text-center sm:py-28">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok/12">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 text-ok">
              <path
                d="m5 12.5 4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <h1 className="mt-7 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {route.h1}
          </h1>

          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            Nous revenons vers vous par téléphone ou par e-mail pour convenir
            d&apos;un créneau et préparer la démonstration sur vos propres cas.
          </p>

          <div className="mt-10">
            <Button href="/" size="lg">
              Revenir à l&apos;accueil
              <ArrowRight />
            </Button>
          </div>

          <p className="mt-8 text-[13.5px] leading-relaxed text-ink-muted">
            En attendant, vous pouvez parcourir{" "}
            <NavLink href="/solutions" className="underline">
              les solutions
            </NavLink>{" "}
            ou{" "}
            <NavLink href="/secteurs" className="underline">
              les métiers couverts
            </NavLink>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
