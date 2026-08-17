"use server";

import {
  validerDemande,
  estProbablementUnRobot,
  envoyerDemande,
  type EtatFormulaire,
} from "@/lib/demo-request";

/**
 * Action serveur du formulaire de démonstration.
 *
 * ⚠️ Une action serveur est un point d'entrée POST public, atteignable par
 * quiconque connaît son identifiant — elle est traitée comme non fiable :
 * toute donnée est revalidée ici, jamais côté client uniquement.
 */
export async function demanderUneDemo(
  _etatPrecedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  /**
   * Robot détecté : on renvoie un succès sans rien envoyer. Répondre par une
   * erreur apprendrait au robot que le piège existe et l'inciterait à réessayer
   * en le contournant.
   */
  if (estProbablementUnRobot(donnees)) {
    return { statut: "succes" };
  }

  const { valeurs, erreurs } = validerDemande(donnees);

  if (Object.keys(erreurs).length > 0) {
    return {
      statut: "erreur",
      message: "Quelques informations sont à corriger.",
      erreurs,
      valeurs,
    };
  }

  const { envoye } = await envoyerDemande(valeurs);

  if (!envoye) {
    return {
      statut: "erreur",
      // Aucune mention de la cause technique : ni configuration, ni fournisseur.
      message:
        "L'envoi n'a pas abouti. Réessayez dans un instant, ou écrivez-nous directement.",
      valeurs,
    };
  }

  return { statut: "succes" };
}
