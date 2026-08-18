"use client";

import { Suspense, useRef, useState } from "react";
import Script from "next/script";
import type { RefObject } from "react";
import { useSearchParams } from "next/navigation";
import {
  optionsSecteur,
  ENDPOINT_DEMANDE,
  CHAMP_PIEGE,
  CHAMP_INSTANT,
  MOTIF_EMAIL,
  MOTIF_TELEPHONE,
  suggererAdresse,
  type ChampDemo,
} from "@/lib/demo-request";
import { NavLink } from "@/components/navigation/NavLink";
import { ArrowRight } from "@/components/ui/Button";
import { site, turnstileSiteKey } from "@/lib/site";

/**
 * Formulaire de demande de démonstration.
 *
 * Cinq champs seulement : la qualification se fait au téléphone, pas dans un
 * formulaire. Chaque champ supplémentaire coûte des demandes.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI UN POST CLASSIQUE ET NON UNE ACTION SERVEUR
 *
 * Le site est déployé en export statique sur un hébergement Apache : il n'y a
 * aucun processus Node en production, donc aucune action serveur possible.
 * Le formulaire poste vers `api/demande.php`, qui refait exactement les mêmes
 * contrôles (validation, piège, délai) avant d'appeler Mailjet, puis :
 *   — succès  → redirige vers /demande-envoyee, un fichier HTML déjà construit ;
 *   — échec   → revient ici avec `?etat=erreur`.
 *
 * ⚠️ LE FORMULAIRE LUI-MÊME NE DOIT JAMAIS DÉPENDRE DE `useSearchParams`.
 * Une lecture de l'URL au niveau du <form> oblige Next à mettre toute la
 * branche derrière <Suspense> : le HTML exporté ne contient alors que le
 * repli, et le formulaire n'existe plus ni pour un visiteur sans JavaScript,
 * ni pour un robot d'indexation. Seule la bannière d'erreur — un détail
 * accessoire — lit l'URL, et elle est isolée dans sa propre frontière.
 *
 * ⚠️ Le serveur reste la seule autorité : les contraintes HTML ci-dessous
 * (`required`, `pattern`) sont un confort de saisie, pas une sécurité. Elles
 * reprennent volontairement les mêmes règles que PHP pour qu'un visiteur
 * légitime ne se fasse jamais refuser après un aller-retour réseau.
 * ─────────────────────────────────────────────────────────────────────────
 */

const champs: {
  nom: ChampDemo;
  libelle: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
  motif?: string;
  titre?: string;
}[] = [
  {
    nom: "nom",
    libelle: "Nom",
    type: "text",
    autoComplete: "name",
  },
  {
    nom: "entreprise",
    libelle: "Entreprise",
    type: "text",
    autoComplete: "organization",
  },
  {
    nom: "email",
    libelle: "E-mail",
    type: "email",
    autoComplete: "email",
    placeholder: "vous@votre-entreprise.fr",
    motif: MOTIF_EMAIL,
    titre: "Indiquez une adresse e-mail valide.",
  },
  {
    nom: "telephone",
    libelle: "Téléphone",
    type: "tel",
    autoComplete: "tel",
    placeholder: "06 12 34 56 78",
    motif: MOTIF_TELEPHONE,
    titre: "Indiquez un numéro où vous joindre.",
  },
];

export function DemoForm() {
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  /**
   * Barrière anti-robot : la DURÉE de remplissage, mesurée ici, dans le
   * navigateur, et transmise au serveur en millisecondes.
   *
   * ⚠️ Ne jamais transmettre un horodatage que le serveur comparerait à sa
   * propre horloge. Les deux horloges ne sont pas synchronisées : en recette,
   * un poste en avance de six secondes produisait une durée négative, donc
   * « inférieure au seuil », et le visiteur était traité comme un robot — sa
   * demande abandonnée en silence, la page de confirmation affichée quand
   * même. Une seule horloge doit servir, du début à la fin de la mesure.
   *
   * `performance.now()` est monotone : ni le fuseau, ni une mise à l'heure
   * réseau, ni un changement d'heure ne peuvent la faire reculer.
   */
  const ouvertureRef = useRef<number | null>(null);
  const champDureeRef = useRef<HTMLInputElement | null>(null);

  /**
   * Adresse corrigée proposée au visiteur, ou `null`. Recalculée à la sortie
   * du champ : pendant la frappe, toute adresse incomplète ressemblerait à une
   * faute et la suggestion clignoterait à chaque caractère.
   */
  const [adresseSuggeree, setAdresseSuggeree] = useState<string | null>(null);

  return (
    <form
      method="post"
      action={ENDPOINT_DEMANDE}
      onSubmit={() => {
        // Écrit juste avant l'envoi : le navigateur construit la charge utile
        // après l'exécution des gestionnaires de soumission.
        if (champDureeRef.current && ouvertureRef.current !== null) {
          champDureeRef.current.value = String(
            Math.round(performance.now() - ouvertureRef.current),
          );
        }
        setEnvoiEnCours(true);
      }}
      className="card p-6 sm:p-8"
    >
      <DureeAntiRobot champRef={champDureeRef} ouvertureRef={ouvertureRef} />
      <ChampPiege />

      {/* Frontière volontairement réduite à la bannière : voir l'en-tête. */}
      <Suspense fallback={null}>
        <MessageErreur />
      </Suspense>

      <div className="space-y-5">
        {champs.map((champ) =>
          champ.nom === "email" ? (
            <Champ
              key={champ.nom}
              {...champ}
              onBlur={(evenement) =>
                setAdresseSuggeree(suggererAdresse(evenement.currentTarget.value))
              }
              aide={
                adresseSuggeree === null ? null : (
                  <SuggestionAdresse
                    adresse={adresseSuggeree}
                    onAcceptee={() => setAdresseSuggeree(null)}
                  />
                )
              }
            />
          ) : (
            <Champ key={champ.nom} {...champ} />
          ),
        )}

        <SelecteurSecteur />
      </div>

      {/*
        Turnstile — contrôle anti-robot de Cloudflare.

        Rendu implicite : le script cherche les éléments portant la classe
        `cf-turnstile` et injecte lui-même, DANS le formulaire, un champ caché
        `cf-turnstile-response`. Le widget doit donc rester à l'intérieur du
        `<form>`, sans quoi le jeton ne partirait pas avec la demande.

        Thème sombre imposé : `globals.css` déclare `color-scheme: dark`, le
        site n'a pas de variante claire. Un widget en « auto » s'afficherait en
        blanc sur fond sombre chez un visiteur dont le système est en clair.
      */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile mt-6"
        data-sitekey={turnstileSiteKey}
        data-language="fr"
        data-theme="dark"
      />

      <button
        type="submit"
        disabled={envoiEnCours}
        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-7 text-[15px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {envoiEnCours ? "Envoi en cours…" : "Demander ma démo"}
        {envoiEnCours ? null : <ArrowRight />}
      </button>

      {/*
        Mention RGPD. La base légale est l'exécution de mesures précontractuelles
        prises à la demande du visiteur : aucune case à cocher n'est requise,
        mais l'information sur le traitement l'est.
      */}
      <p className="mt-5 text-[12.5px] leading-relaxed text-ink-muted">
        Ces informations servent uniquement à vous recontacter au sujet de votre
        demande de démonstration. Elles ne sont ni revendues, ni utilisées à
        d&apos;autres fins. Vous pouvez demander leur suppression à tout moment
        — voir la{" "}
        <NavLink href="/politique-de-confidentialite" className="underline">
          politique de confidentialité
        </NavLink>
        .
      </p>
    </form>
  );
}

/* ==========================================================================
   MESSAGE D'ERREUR
   ========================================================================== */

/**
 * Un envoi refusé ne doit jamais être un cul-de-sac : le visiteur a pris la
 * peine de remplir cinq champs. On lui donne immédiatement une porte de sortie
 * réelle — l'adresse de contact —, sans jamais révéler la cause technique.
 *
 * Sans JavaScript, la bannière ne s'affiche pas : le visiteur retrouve
 * simplement le formulaire, ce qui reste la bonne invitation après un échec.
 * La confirmation de succès, elle, ne dépend d'aucun script — c'est une page
 * à part entière (/demande-envoyee).
 */
function MessageErreur() {
  if (useSearchParams().get("etat") !== "erreur") return null;

  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3"
    >
      <p className="text-sm text-ink">
        L&apos;envoi n&apos;a pas abouti. Réessayez dans un instant
        {site.email ? (
          <>
            , ou écrivez-nous directement à{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
          </>
        ) : null}
        .
      </p>
    </div>
  );
}

/* ==========================================================================
   CHAMPS
   ========================================================================== */

const classesChamp =
  "w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-[15px] text-ink " +
  "placeholder:text-ink-muted transition-colors " +
  "focus:border-accent-text focus:outline-none";

function Champ({
  nom,
  libelle,
  type,
  autoComplete,
  placeholder,
  motif,
  titre,
  onBlur,
  aide,
}: {
  nom: ChampDemo;
  libelle: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
  motif?: string;
  titre?: string;
  /** Sortie du champ. Utilisé par l'e-mail pour proposer une correction. */
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  /** Message affiché sous le champ. Jamais bloquant. */
  aide?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={nom} className="mb-2 block text-[13px] font-medium text-ink">
        {libelle}
      </label>
      <input
        id={nom}
        name={nom}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        pattern={motif}
        title={titre}
        required
        onBlur={onBlur}
        className={classesChamp}
      />
      {aide}
    </div>
  );
}

/**
 * Proposition de correction d'adresse.
 *
 * Le champ est retrouvé par le formulaire du bouton plutôt que par une `ref` :
 * le bouton est DANS le formulaire, `elements` le lui donne, et cela évite de
 * faire traverser une ref à travers une frontière de props — ce que la règle
 * `react-hooks/immutability` refuse, à juste titre.
 */
function SuggestionAdresse({
  adresse,
  onAcceptee,
}: {
  adresse: string;
  onAcceptee: () => void;
}) {
  return (
    <p className="mt-2 text-[13px] text-ink-soft">
      Vouliez-vous dire{" "}
      <button
        type="button"
        onClick={(evenement) => {
          const champ = evenement.currentTarget.form?.elements.namedItem("email");
          if (champ instanceof HTMLInputElement) champ.value = adresse;
          onAcceptee();
        }}
        className="font-medium text-accent-text underline underline-offset-4 transition-colors hover:text-ink"
      >
        {adresse}
      </button>
      {" ?"}
    </p>
  );
}

function SelecteurSecteur() {
  return (
    <div>
      <label
        htmlFor="secteur"
        className="mb-2 block text-[13px] font-medium text-ink"
      >
        Votre activité
      </label>
      <select
        id="secteur"
        name="secteur"
        defaultValue=""
        required
        className={classesChamp}
      >
        <option value="" disabled>
          Choisissez…
        </option>
        {optionsSecteur.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ==========================================================================
   ANTI-SPAM
   ========================================================================== */

/**
 * Champ piège. Masqué par `hidden` plutôt que par une classe utilitaire pour
 * qu'aucune purge CSS ne puisse le rendre visible par accident.
 * `tabIndex={-1}` et `aria-hidden` le retirent du parcours clavier et du
 * plan d'accessibilité : un humain ne peut ni le voir, ni l'atteindre.
 */
function ChampPiege() {
  return (
    <div hidden aria-hidden="true">
      <label htmlFor={CHAMP_PIEGE}>Ne pas remplir</label>
      <input
        id={CHAMP_PIEGE}
        name={CHAMP_PIEGE}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

/**
 * Champ portant la durée de remplissage, en millisecondes.
 *
 * ⚠️ L'instant d'ouverture est relevé par le navigateur, jamais au rendu : la
 * page est un fichier HTML figé au moment du build. Une valeur calculée au
 * rendu serait gravée dans le fichier livré, et le délai serait toujours
 * considéré comme écoulé — la barrière ne servirait plus à rien.
 *
 * Le champ part vide si le visiteur navigue sans JavaScript : PHP ne bloque
 * alors pas, et le champ piège fait seul le travail.
 */
function DureeAntiRobot({
  champRef,
  ouvertureRef,
}: {
  champRef: RefObject<HTMLInputElement | null>;
  ouvertureRef: RefObject<number | null>;
}) {
  return (
    <input
      type="hidden"
      name={CHAMP_INSTANT}
      defaultValue=""
      ref={(element) => {
        champRef.current = element;
        // Premier montage seulement : un remontage ne doit pas remettre le
        // chronomètre à zéro, sinon le visiteur repasserait sous le seuil.
        if (element && ouvertureRef.current === null) {
          ouvertureRef.current = performance.now();
        }
      }}
    />
  );
}
