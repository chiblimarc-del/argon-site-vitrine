import { BlocProfondeur, type TroisPreuves } from "./BlocProfondeur";

/**
 * BLOC 3 — LES ENGAGEMENTS.
 * /solutions/gestion-interventions, après « tout ce qui s'est passé ».
 *
 * Placé sur l'exploitation et non sur la facturation, volontairement : un bon
 * de commande naît sur un chantier, pas dans un dossier client. C'est une
 * information d'exploitation née du terrain — donc dans la chaîne.
 *
 * RÈGLE DE VÉRITÉ : le périmètre est l'ENGAGEMENT D'EXPLOITATION. Ni contrôle
 * financier, ni comptabilité, ni trésorerie, ni budget prévisionnel.
 */

const preuves: TroisPreuves = [
  {
    titre: "L'engagement est écrit",
    texte:
      "Chaque bon de commande porte sa référence et son tarif. Ce qui a été commandé ne vit plus dans une tête ni dans un fil de messages.",
  },
  {
    titre: "Il reste rattaché",
    texte:
      "Des mois plus tard, vous retrouvez à quoi une somme correspond, et pour quel chantier.",
  },
  {
    titre: "Vous voyez quel poste dérive",
    texte:
      "Les états de dépenses se lisent par poste, pas seulement en total. Un budget ne se dégrade jamais partout en même temps.",
  },
];

export function EngagementsSection() {
  return (
    <BlocProfondeur
      eyebrow="Avant la dépense"
      titre="Vous savez où part votre argent avant de recevoir la facture."
      chapo="Une dépense n'est plus une surprise à l'ouverture du courrier. Ce qui est engagé sur le terrain est enregistré au moment où on l'engage."
      preuves={preuves}
      frontiere={
        <>
          Argon suit ce qui a été engagé dans votre exploitation. Il ne remplace
          ni votre contrôle financier, ni votre comptabilité.
        </>
      }
      passerelle={{
        href: "/secteurs/installation",
        libelle: "Installation : un chantier, des phases, des engagements",
      }}
    />
  );
}
