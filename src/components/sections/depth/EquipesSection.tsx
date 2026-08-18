import { BlocProfondeur, type TroisPreuves } from "./BlocProfondeur";

/**
 * BLOC 5 — LES ÉQUIPES.
 * /solutions/planning-interventions, après « la journée entière ».
 *
 * L'angle est LA MÊME PLANIFICATION, pas « un module RH ». C'est ce qui
 * rattache le bloc à la chaîne : les heures et les absences naissent de la
 * planification des interventions, donc d'une information de terrain.
 *
 * Onze sujets tiennent dans trois preuves. Ce n'est pas une contrainte subie :
 * un bloc RH complet ferait basculer une page de planning dans le catalogue.
 * La troisième ligne REGROUPE volontairement — l'énumérer les tuerait.
 *
 * RÈGLE DE VÉRITÉ : Argon suit le temps et les absences. Il ne fait pas la
 * paie. Interdits : bulletin, cotisation, déclaration sociale, DSN, calcul de
 * majoration légale, congés payés au sens du droit du travail.
 */

const preuves: TroisPreuves = [
  {
    titre: "Le temps",
    texte:
      "Heures saisies, récapitulatif mensuel, écart au forfait contractuel. Vous voyez le solde, pas seulement le total.",
  },
  {
    titre: "Les absences",
    texte: (
      <>
        Un congé suit son circuit : demandé, approuvé ou refusé. Une absence
        validée apparaît dans le planning{" "}
        <span className="font-medium text-ink">avant</span> qu&apos;on affecte
        quelqu&apos;un qui ne sera pas là.
      </>
    ),
  },
  {
    titre: "Le reste du suivi",
    texte:
      "Notes, frais, acomptes, documents et leurs échéances restent attachés au dossier du salarié — au même endroit que ses heures.",
  },
];

export function EquipesSection() {
  return (
    <BlocProfondeur
      eyebrow="Les mêmes équipes"
      titre="Le suivi de vos équipes ne se fait plus dans des fichiers à côté."
      chapo="Ce qui est planifié, ce qui est fait et ce qui est compté sont la même information. Personne ne la ressaisit le vendredi soir."
      preuves={preuves}
      frontiere={
        <>
          Argon suit le temps et les absences de vos équipes. Il ne fait pas
          votre paie.
        </>
      }
      passerelle={{
        href: "/secteurs/cvc",
        libelle: "CVC : deux saisons, deux charges",
      }}
    />
  );
}
