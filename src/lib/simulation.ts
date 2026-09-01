import { formaterEuros, formaterHeures } from "./tarifs.ts";

/**
 * LE SIMULATEUR MÈNE ENFIN QUELQUE PART.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE QUE CE FICHIER CORRIGE
 *
 * Le visiteur saisissait trois chiffres, voyait ce que lui coûte son
 * organisation actuelle, lisait « ce calcul ne prouve rien », et repartait.
 * Aucun lien, aucun bouton : vérifié le 31/08/2026, les trois simulateurs
 * n'émettaient pas un seul CTA. C'était le contraire d'un tunnel — quelqu'un
 * qui vient de chiffrer sa propre perte est le visiteur le plus avancé du
 * site, et c'est précisément celui qu'on laissait partir.
 *
 * ⚠️ CE QUI EST TRANSMIS, ET QUAND. Rien n'est envoyé pendant le calcul : il
 * se fait entièrement dans le navigateur, et la mention sous le simulateur le
 * dit toujours. Le résumé n'accompagne la demande QUE si le visiteur clique
 * sur le bouton du bloc de résultat — l'acte vaut la décision — et il est
 * alors AFFICHÉ sur le formulaire, avec un bouton pour le retirer. Un chiffre
 * joint à son insu serait exactement le genre de promesse tenue de travers que
 * ce site refuse.
 *
 * ⚠️ RIEN N'EST ÉCRIT DANS LE NAVIGATEUR — même mécanisme que
 * `src/lib/provenance.ts` : une variable de module, qui disparaît au
 * rechargement. Ni cookie, ni `localStorage`, ni `sessionStorage`. La
 * politique de confidentialité reste exacte.
 *
 * ⚠️ LE RÉSUMÉ EST UNE PHRASE, PAS UNE DONNÉE STRUCTURÉE. Il finit dans un
 * e-mail lu par un humain, pas dans une base. Le jour où le raccord CRM
 * existera (étape 4 de la feuille de route), c'est `DonneesSimulation`
 * qu'il faudra sérialiser, pas cette chaîne.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Ce que le simulateur de gains a réellement calculé. */
export interface DonneesSimulation {
  /** Utilisateurs terrain retenus dans le simulateur de prix. */
  terrains: number;
  /** Libellé du plan retenu (« Business »…). */
  plan: string;
  /** Heures récupérées par mois, après application de la part supprimable. */
  heuresRecuperees: number;
  /** Ce que ces heures valent au coût horaire saisi, par mois. */
  valeurMensuelle: number;
  /** Coût Argon correspondant, par mois. */
  coutMensuel: number;
  /** Valeur moins coût. Peut être négatif, et s'affiche tel quel. */
  soldeMensuel: number;
}

/**
 * Résume la simulation en une ligne lisible dans un e-mail.
 *
 * Fonction pure : c'est elle qu'on teste, plutôt que le composant qui
 * l'appelle. Le solde négatif n'est pas masqué — un simulateur qui ne sait
 * annoncer que de bonnes nouvelles n'est plus un simulateur.
 */
export function resumerSimulation(donnees: DonneesSimulation): string {
  const signe = donnees.soldeMensuel >= 0 ? "+" : "−";

  return [
    `${donnees.terrains} terrains`,
    `plan ${donnees.plan}`,
    `${formaterHeures(donnees.heuresRecuperees)} h/mois récupérées`,
    `valeur ${formaterEuros(donnees.valeurMensuelle)}/mois`,
    `coût ${formaterEuros(donnees.coutMensuel)}/mois`,
    `solde ${signe} ${formaterEuros(Math.abs(donnees.soldeMensuel))}/mois`,
  ].join(" · ");
}

/* ==========================================================================
   MÉMOIRE — la simulation que le visiteur a choisi d'emporter
   ========================================================================== */

export interface SimulationEmportee {
  /** Quel simulateur : aujourd'hui « gains », et lui seul. */
  simulateur: string;
  /** Le résumé lisible, déjà formaté. */
  resume: string;
}

let simulation: SimulationEmportee | null = null;

/**
 * Abonnés à la mémoire.
 *
 * ⚠️ C'est un STORE EXTERNE au sens de React, et il est lu par
 * `useSyncExternalStore` — pas par un `useEffect` qui appellerait `setState`.
 * La première version faisait exactement cela et ESLint l'a refusée : un
 * `setState` synchrone dans un effet provoque un rendu en cascade. La règle
 * avait raison, et le bon outil existait déjà.
 *
 * Conséquence à respecter : `simulationEmportee()` doit rendre une référence
 * STABLE tant que rien n'a changé, sinon React re-rend en boucle. C'est le cas
 * ici — on rend l'objet lui-même, jamais une copie.
 */
const abonnes = new Set<() => void>();

function prevenir(): void {
  for (const abonne of abonnes) abonne();
}

/** Souscription au sens de `useSyncExternalStore`. */
export function abonnerSimulation(surChangement: () => void): () => void {
  abonnes.add(surChangement);
  return () => {
    abonnes.delete(surChangement);
  };
}

/**
 * Appelé par le bouton du bloc de résultat, jamais au fil de la saisie :
 * enregistrer à chaque frappe reviendrait à emporter une simulation que le
 * visiteur n'a pas décidé d'emporter.
 */
export function emporterSimulation(donnees: DonneesSimulation): void {
  simulation = { simulateur: "gains", resume: resumerSimulation(donnees) };
  prevenir();
}

/** La simulation emportée, ou `null` si le visiteur n'en a emporté aucune. */
export function simulationEmportee(): SimulationEmportee | null {
  return simulation;
}

/**
 * Instantané côté serveur : toujours `null`.
 *
 * Le site est prérendu au build. Rendre autre chose ici ferait annoncer par le
 * HTML servi une simulation que le visiteur n'a pas faite — et produirait une
 * différence d'hydratation.
 */
export function simulationAuRendu(): null {
  return null;
}

/**
 * Le visiteur retire sa simulation depuis le formulaire. C'est ce qui rend le
 * mécanisme honnête : ce qui est affiché peut être enlevé.
 */
export function oublierSimulation(): void {
  simulation = null;
  prevenir();
}

/* ==========================================================================
   NOMS DES CHAMPS
   Doivent rester identiques à ceux que lit `deploy/api/demande.php`.
   ========================================================================== */

export const CHAMPS_SIMULATION = {
  simulateur: "origine_simulateur",
  resultat: "origine_resultat",
} as const;
