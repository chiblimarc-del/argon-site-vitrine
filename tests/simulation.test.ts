import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  CHAMPS_SIMULATION,
  emporterSimulation,
  oublierSimulation,
  resumerSimulation,
  simulationEmportee,
  type DonneesSimulation,
} from "../src/lib/simulation.ts";

/**
 * Le simulateur mène quelque part depuis le 01/09/2026. Ce qui est vérifié
 * ici, c'est ce qui part avec la demande — et surtout ce qui n'en part pas
 * tant que le visiteur ne l'a pas décidé.
 */

const CALCUL: DonneesSimulation = {
  terrains: 12,
  plan: "Business",
  heuresRecuperees: 34.2,
  valeurMensuelle: 2380,
  coutMensuel: 449,
  soldeMensuel: 1931,
};

describe("résumé de la simulation", () => {
  test("porte les six informations, dans l'ordre de lecture", () => {
    const resume = resumerSimulation(CALCUL);
    assert.match(resume, /12 terrains/);
    assert.match(resume, /plan Business/);
    assert.match(resume, /h\/mois récupérées/);
    assert.match(resume, /valeur /);
    assert.match(resume, /coût /);
    assert.match(resume, /solde /);
  });

  test("un solde négatif s'affiche comme tel, jamais masqué", () => {
    const resume = resumerSimulation({ ...CALCUL, soldeMensuel: -180 });
    assert.match(resume, /solde −/, "le signe moins doit être visible");
    assert.doesNotMatch(resume, /solde \+/);
  });

  test("un solde positif porte son signe", () => {
    assert.match(resumerSimulation(CALCUL), /solde \+/);
  });

  test("tient sur une ligne : c'est une ligne d'e-mail, pas un rapport", () => {
    const resume = resumerSimulation(CALCUL);
    assert.equal(resume.includes("\n"), false);
    assert.ok(resume.length < 200, `résumé trop long : ${resume.length}`);
  });
});

describe("ce que le visiteur emporte", () => {
  beforeEach(() => oublierSimulation());

  test("rien n'est emporté tant qu'on n'a pas cliqué", () => {
    assert.equal(
      simulationEmportee(),
      null,
      "le calcul seul ne doit jamais partir : c'est ce que promet la mention du simulateur",
    );
  });

  test("le clic emporte le résumé et nomme le simulateur", () => {
    emporterSimulation(CALCUL);
    const emportee = simulationEmportee();
    assert.equal(emportee?.simulateur, "gains");
    assert.match(emportee?.resume ?? "", /12 terrains/);
  });

  test("le visiteur peut retirer sa simulation", () => {
    emporterSimulation(CALCUL);
    oublierSimulation();
    assert.equal(
      simulationEmportee(),
      null,
      "le bouton « Retirer » du formulaire doit vraiment retirer",
    );
  });

  test("un second calcul remplace le premier", () => {
    emporterSimulation(CALCUL);
    emporterSimulation({ ...CALCUL, terrains: 40 });
    assert.match(simulationEmportee()?.resume ?? "", /40 terrains/);
  });
});

describe("contrat avec le serveur", () => {
  test("les noms des champs sont ceux que lit demande.php", () => {
    assert.deepEqual(CHAMPS_SIMULATION, {
      simulateur: "origine_simulateur",
      resultat: "origine_resultat",
    });
  });
});
