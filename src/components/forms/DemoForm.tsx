"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { demanderUneDemo } from "@/app/demander-une-demo/actions";
import {
  etatInitial,
  optionsSecteur,
  CHAMP_PIEGE,
  CHAMP_INSTANT,
  type ChampDemo,
  type EtatFormulaire,
} from "@/lib/demo-request";
import { NavLink } from "@/components/navigation/NavLink";
import { ArrowRight } from "@/components/ui/Button";

/**
 * Formulaire de demande de démonstration.
 *
 * Cinq champs seulement : la qualification se fait au téléphone, pas dans un
 * formulaire. Chaque champ supplémentaire coûte des demandes.
 *
 * Fonctionne sans JavaScript : `<form action={action}>` poste vers l'action
 * serveur, qui renvoie la page rendue avec son état. Le JavaScript n'ajoute que
 * l'état « envoi en cours » et l'horodatage anti-robot.
 */

const champs: {
  nom: ChampDemo;
  libelle: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
}[] = [
  { nom: "nom", libelle: "Nom", type: "text", autoComplete: "name" },
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
  },
  {
    nom: "telephone",
    libelle: "Téléphone",
    type: "tel",
    autoComplete: "tel",
    placeholder: "06 12 34 56 78",
  },
];

export function DemoForm() {
  const [etat, action] = useActionState<EtatFormulaire, FormData>(
    demanderUneDemo,
    etatInitial,
  );

  if (etat.statut === "succes") return <Confirmation />;

  return (
    <form action={action} noValidate className="card p-6 sm:p-8">
      <HorodatageAntiRobot />
      <ChampPiege />

      {etat.message ? (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink"
        >
          {etat.message}
        </p>
      ) : null}

      <div className="space-y-5">
        {champs.map((champ) => (
          <Champ
            key={champ.nom}
            {...champ}
            erreur={etat.erreurs?.[champ.nom]}
            defaut={etat.valeurs?.[champ.nom]}
          />
        ))}

        <SelecteurSecteur
          erreur={etat.erreurs?.secteur}
          defaut={etat.valeurs?.secteur}
        />
      </div>

      <BoutonEnvoi />

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
   CHAMPS
   ========================================================================== */

const classesChamp =
  "w-full rounded-lg border bg-surface-2 px-3.5 py-2.5 text-[15px] text-ink " +
  "placeholder:text-ink-muted transition-colors " +
  "focus:border-accent-text focus:outline-none";

function Champ({
  nom,
  libelle,
  type,
  autoComplete,
  placeholder,
  erreur,
  defaut,
}: {
  nom: ChampDemo;
  libelle: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
  erreur?: string;
  defaut?: string;
}) {
  const idErreur = `${nom}-erreur`;
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
        defaultValue={defaut}
        required
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? idErreur : undefined}
        className={`${classesChamp} ${erreur ? "border-danger" : "border-line"}`}
      />
      {erreur ? (
        <p id={idErreur} className="mt-1.5 text-[12.5px] text-danger">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

function SelecteurSecteur({
  erreur,
  defaut,
}: {
  erreur?: string;
  defaut?: string;
}) {
  return (
    <div>
      <label
        htmlFor="secteur"
        className="mb-2 block text-[13px] font-medium text-ink"
      >
        Votre activité
      </label>
      <select
        // `defaultValue` ne s'applique qu'au montage : sans cette clé, le
        // sélecteur repartait vide après un renvoi en erreur, alors que les
        // champs texte conservaient leur saisie. La clé force le remontage
        // quand le serveur renvoie une valeur.
        key={defaut ?? "vide"}
        id="secteur"
        name="secteur"
        defaultValue={defaut ?? ""}
        required
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? "secteur-erreur" : undefined}
        className={`${classesChamp} ${erreur ? "border-danger" : "border-line"}`}
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
      {erreur ? (
        <p id="secteur-erreur" className="mt-1.5 text-[12.5px] text-danger">
          {erreur}
        </p>
      ) : null}
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
 * Horodatage d'ouverture, posé après le montage. Il n'est donc jamais rendu
 * côté serveur : la page reste entièrement statique et cacheable.
 * Absent sans JavaScript — dans ce cas le champ piège fait seul le travail.
 */
function HorodatageAntiRobot() {
  const ref = useRef<HTMLInputElement>(null);

  // On écrit directement dans le DOM plutôt que de passer par un état : le
  // champ n'a pas besoin d'être contrôlé, et cela évite un rendu inutile.
  // Surtout, `Date.now()` ne doit PAS être évalué au rendu — il serait figé
  // dans le HTML statique au moment du build, et le délai serait toujours
  // considéré comme écoulé.
  useEffect(() => {
    if (ref.current) ref.current.value = String(Date.now());
  }, []);

  return <input ref={ref} type="hidden" name={CHAMP_INSTANT} defaultValue="" />;
}

/* ==========================================================================
   ENVOI ET CONFIRMATION
   ========================================================================== */

function BoutonEnvoi() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-7 text-[15px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Envoi en cours…" : "Demander ma démo"}
      {pending ? null : <ArrowRight />}
    </button>
  );
}

/** Confirmation sur place : le formulaire est remplacé, sans changer de page. */
function Confirmation() {
  return (
    <div role="status" className="card p-8 text-center sm:p-10">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ok/12">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-ok">
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

      <h2 className="mt-6 text-xl font-semibold text-ink">
        Votre demande est bien partie.
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-soft">
        Nous revenons vers vous par téléphone ou par e-mail pour convenir d&apos;un
        créneau et préparer la démonstration sur vos propres cas.
      </p>
    </div>
  );
}
