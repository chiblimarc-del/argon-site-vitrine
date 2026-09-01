import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  CHAMPS_PROVENANCE,
  cheminPrecedentConnu,
  construireProvenance,
  enregistrerChemin,
  reinitialiserProvenance,
} from "../src/lib/provenance.ts";

/**
 * Tests du côté NAVIGATEUR de la provenance — la moitié TypeScript de la
 * réponse à « quelle page a produit cette demande ? ». L'autre moitié, celle
 * qui décide en PHP, est éprouvée par `deploy/api/tests/`.
 *
 * Lancés par `npm test`, sans aucune dépendance : `node --test` et le
 * décodage des types natifs de Node suffisent.
 *
 * ⚠️ `src/lib/provenance.ts` importe `./routes` en chemin RELATIF, et non par
 * l'alias `@/`. C'est ce qui permet à Node de le charger sans outillage : Node
 * ne lit pas les `paths` de tsconfig.json. Repasser cet import en `@/lib/routes`
 * rendrait ce fichier de test impossible à exécuter.
 */

const ORIGINE = "https://www.argon-mobility.com";

function entrees(surcharges: Partial<Parameters<typeof construireProvenance>[0]> = {}) {
  return {
    cheminPrecedent: null,
    referrer: "",
    origineSite: ORIGINE,
    parametres: new URLSearchParams(""),
    ...surcharges,
  };
}

describe("mémoire de navigation", () => {
  beforeEach(() => reinitialiserProvenance());

  test("au premier chargement, il n'y a pas de page précédente", () => {
    enregistrerChemin("/demander-une-demo");
    assert.equal(cheminPrecedentConnu(), null);
  });

  test("après une navigation, la page précédente est retenue", () => {
    enregistrerChemin("/secteurs/cvc");
    enregistrerChemin("/demander-une-demo");
    assert.equal(cheminPrecedentConnu(), "/secteurs/cvc");
  });

  test("un même chemin répété ne décale pas la mémoire", () => {
    enregistrerChemin("/secteurs/cvc");
    enregistrerChemin("/demander-une-demo");
    enregistrerChemin("/demander-une-demo");
    assert.equal(
      cheminPrecedentConnu(),
      "/secteurs/cvc",
      "un re-rendu ferait autrement de la page du formulaire sa propre origine",
    );
  });

  test("trois pages : c'est la dernière avant le formulaire qui compte", () => {
    enregistrerChemin("/");
    enregistrerChemin("/solutions");
    enregistrerChemin("/solutions/devis-facturation");
    enregistrerChemin("/demander-une-demo");
    assert.equal(cheminPrecedentConnu(), "/solutions/devis-facturation");
  });
});

describe("construction de la provenance", () => {
  test("navigation interne : la page d'origine et son titre lisible", () => {
    const p = construireProvenance(entrees({ cheminPrecedent: "/secteurs/cvc" }));
    assert.equal(p.url, "/secteurs/cvc");
    assert.equal(p.titre, "Logiciel de gestion des interventions CVC");
    assert.equal(p.titre.includes("| Argon"), false, "le suffixe de marque est retiré");
  });

  test("le titre vient du registre, jamais d'une table recopiée", () => {
    const p = construireProvenance(entrees({ cheminPrecedent: "/tarifs" }));
    assert.equal(p.url, "/tarifs");
    assert.notEqual(p.titre, "", "une route du registre doit toujours donner un titre");
  });

  test("arrivée depuis Google : la source est l'hôte, pas l'URL entière", () => {
    const p = construireProvenance(
      entrees({ referrer: "https://www.google.com/search?q=logiciel+intervention" }),
    );
    assert.equal(p.source, "www.google.com");
    assert.equal(p.url, "", "aucune page interne ne peut être nommée dans ce cas");
  });

  test("referrer interne sans mémoire : le chemin est récupéré du referrer", () => {
    const p = construireProvenance(
      entrees({ referrer: `${ORIGINE}/solutions/planning-interventions` }),
    );
    assert.equal(p.url, "/solutions/planning-interventions");
    assert.equal(p.source, "", "un referrer interne n'est pas une source extérieure");
  });

  test("la mémoire l'emporte sur le referrer", () => {
    const p = construireProvenance(
      entrees({
        cheminPrecedent: "/secteurs/depannage",
        referrer: "https://www.google.com/",
      }),
    );
    assert.equal(p.url, "/secteurs/depannage", "la page cliquée");
    assert.equal(p.source, "www.google.com", "et la source d'entrée sur le site");
  });

  test("le formulaire n'est jamais sa propre page d'origine", () => {
    const p = construireProvenance(entrees({ cheminPrecedent: "/demander-une-demo" }));
    assert.equal(p.url, "");
    assert.equal(p.titre, "");
  });

  test("chemin absent du registre : l'URL reste, le titre est vide", () => {
    const p = construireProvenance(entrees({ cheminPrecedent: "/page-inexistante" }));
    assert.equal(p.url, "/page-inexistante");
    assert.equal(p.titre, "", "on n'invente pas un titre pour une route inconnue");
  });

  test("referrer illisible : aucune exception, aucune information", () => {
    const p = construireProvenance(entrees({ referrer: "pas une url" }));
    assert.equal(p.source, "");
    assert.equal(p.url, "");
  });

  test("accès direct : tout est vide, et c'est une réponse valable", () => {
    const p = construireProvenance(entrees());
    assert.deepEqual(p, { url: "", titre: "", source: "", campagne: "" });
  });

  test("paramètres de campagne : repris dans l'ordre déclaré", () => {
    const p = construireProvenance(
      entrees({
        parametres: new URLSearchParams("utm_source=linkedin&utm_campaign=lancement"),
      }),
    );
    assert.equal(p.campagne, "utm_source=linkedin utm_campaign=lancement");
  });

  test("paramètre vide : ignoré plutôt que reporté à moitié", () => {
    const p = construireProvenance(
      entrees({ parametres: new URLSearchParams("utm_source=&gclid=abc123") }),
    );
    assert.equal(p.campagne, "gclid=abc123");
  });

  test("aucun paramètre de campagne : chaîne vide", () => {
    const p = construireProvenance(entrees({ parametres: new URLSearchParams("etat=erreur") }));
    assert.equal(p.campagne, "");
  });
});

describe("contrat avec le serveur", () => {
  test("les noms des champs sont ceux que lit demande.php", () => {
    assert.deepEqual(CHAMPS_PROVENANCE, {
      url: "origine_url",
      titre: "origine_titre",
      source: "origine_source",
      campagne: "origine_campagne",
    });
  });
});
