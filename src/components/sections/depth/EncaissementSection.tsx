import { BlocProfondeur, type TroisPreuves } from "./BlocProfondeur";

/**
 * BLOC 1 — L'ENCAISSEMENT.
 * /solutions/devis-facturation, après « une facturation d'exploitation ».
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RÈGLE DE VÉRITÉ — FORMULATIONS JURIDIQUEMENT SENSIBLES
 *
 * Deux affirmations ont été relues dans le code du produit avant d'être
 * écrites ici (relance-calculator.ts, entreprise-info) :
 *
 * 1. L'indemnité forfaitaire. Le produit applique un MONTANT PARAMÉTRÉ par
 *    l'entreprise (valeur par défaut 40 €), aux niveaux RELANCE_3 et
 *    MISE_EN_DEMEURE uniquement, et seulement si le retard est constaté.
 *    Le site NE DOIT PAS écrire qu'Argon applique la règle légale à la place
 *    de l'utilisateur : il applique ce que l'utilisateur a paramétré.
 *
 * 2. La valeur juridique de la mise en demeure. Argon suit des FAITS — dépôt
 *    du recommandé, accusé de réception, délai. Il ne qualifie pas. Toute
 *    formulation du type « la mise en demeure tient juridiquement » est
 *    interdite : aucun logiciel ne peut garantir cette validité.
 *
 * INTERDIT également : laisser entendre qu'une relance ou une mise en demeure
 * PART automatiquement. Le calendrier de la procédure progresse seul, l'envoi
 * jamais. C'est la frontière du bloc, et elle est vraie.
 * ─────────────────────────────────────────────────────────────────────────
 */

const preuves: TroisPreuves = [
  {
    titre: "Ce qui est réglé, ce qui reste dû",
    texte:
      "Chaque règlement est enregistré et rattaché à sa facture. Un acompte laisse la facture en « partielle », jamais en « payée » : vous voyez le solde réel, pas un statut approximatif.",
  },
  {
    titre: "La relance suit une procédure, pas votre humeur",
    texte:
      "Rappel, deuxième relance, troisième, puis mise en demeure. Chaque étape se déverrouille au délai que vous avez fixé. À partir de la troisième, le décompte reprend le principal, les intérêts de retard et l'indemnité forfaitaire que vous avez paramétrée.",
  },
  {
    titre: "Vous voyez où en est la procédure",
    texte:
      "Recommandé déposé ou non, accusé de réception reçu ou non, délai de réponse en cours ou expiré. Argon suit les éléments de la procédure et vous dit ce qu'il manque — la qualification juridique reste la vôtre.",
  },
];

export function EncaissementSection() {
  return (
    <BlocProfondeur
      eyebrow="Se faire payer"
      titre="Vous savez ce qui n'est pas encore payé, et ce que vous en avez fait."
      chapo="Une facture émise n'est pas une facture encaissée. Argon garde les deux en vue, et ne vous laisse pas relancer de mémoire."
      preuves={preuves}
      frontiere={
        <>
          Argon cadre la relance et la procédure amiable.{" "}
          <span className="font-medium text-ink">
            C&apos;est vous qui décidez d&apos;envoyer
          </span>{" "}
          — aucune mise en demeure ne part toute seule.
        </>
      }
      passerelle={{
        href: "/secteurs/transport-courses",
        libelle: "Transport & courses : le délai de paiement chez un donneur d'ordre",
      }}
    />
  );
}
