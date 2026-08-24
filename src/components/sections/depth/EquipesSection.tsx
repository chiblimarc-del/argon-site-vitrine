import { BlocProfondeur, type TroisPreuves } from "./BlocProfondeur";

/**
 * BLOC ÉQUIPES — /solutions/planning-interventions
 *
 * REFAIT AU LOT 4.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QUI A CHANGÉ, ET POURQUOI
 *
 * L'ancienne version empilait trois territoires — le temps, les absences,
 * « le reste du suivi ». Trois étiquettes closes sur elles-mêmes, dont la
 * troisième alignait quatre mots (« notes, frais, acomptes, documents »)
 * sans en développer aucun.
 *
 * Le commentaire assumait le regroupement : « Onze sujets tiennent dans trois
 * preuves… La troisième ligne REGROUPE volontairement ». Regrouper est
 * légitime. Mais regrouper n'autorise pas à empiler, et deux des quatre mots
 * n'avaient aucun mécanisme derrière eux.
 *
 * Chaque preuve porte désormais un MÉCANISME et CE QU'IL ÉVITE. C'est la
 * mécanique éditoriale en quatre temps appliquée au format du bloc :
 * le chapô porte le bénéfice, chaque preuve porte son comment et son évitement.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * La passerelle ouvre /solutions/heures-et-absences, qui développe les cinq
 * sujets que ce bloc ne fait que nommer. Elle n'existe QUE parce que la page
 * existe : un lien creux coûte plus qu'un lien absent.
 *
 * Server Component, zéro JavaScript client.
 */

const PREUVES: TroisPreuves = [
  {
    titre: "Un congé accordé ferme le planning au même instant.",
    texte:
      "La demande part du mobile, le bureau accorde. Le technicien devient non planifiable et le motif apparaît sur sa grille d'heures — sans que personne ne l'ait recopié. Vous n'affectez plus une mission à quelqu'un qui ne sera pas là.",
  },
  {
    titre: "Le dépassement du forfait se voit avant la paie.",
    texte:
      "Les heures relevées se confrontent au forfait contractuel, mois après mois, et le reliquat cumule depuis l'origine. Vous arbitrez pendant qu'il est encore temps d'arbitrer, au lieu de constater.",
  },
  {
    titre:
      "Les heures d'un intérimaire restent séparées de celles qui alimentent la paie.",
    texte:
      "Deux tableaux, jamais un total commun. Celles de l'agence servent à contrôler sa facture ; celles de vos salariés servent à autre chose. Un compteur ne peut plus gonfler sans qu'on sache ce qu'on paie et ce qu'on refacture.",
  },
];

export function EquipesSection() {
  return (
    <BlocProfondeur
      eyebrow="Le temps de vos équipes"
      titre="Une absence saisie une fois. Le planning et les heures suivent."
      chapo="Le planning ne peut pas contredire les absences, et les absences ne peuvent pas contredire les heures : c'est la même information, lue à trois endroits."
      preuves={PREUVES}
      frontiere="Argon ne tient pas de compteur de droits à congés et ne produit aucun bulletin de paie. Il relève, confronte au forfait et garde la trace — la paie se fait ailleurs, avec ces éléments."
      passerelle={{
        href: "/solutions/heures-et-absences",
        libelle: "Le détail du suivi des heures et des absences",
      }}
    />
  );
}

export default EquipesSection;
