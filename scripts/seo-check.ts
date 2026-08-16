/**
 * Vérification automatique de la matrice SEO.
 *
 * Rend la stratégie exécutable : ce qui était une règle écrite dans le cahier
 * devient un test qui échoue. À lancer avec `npm run seo:check`, et à brancher
 * en CI avant tout déploiement.
 *
 * Contrôles :
 *  1. title unique sur tout le site
 *  2. title ≤ 60 caractères (au-delà, Google tronque ou réécrit)
 *  3. meta description présente et ≤ 160 caractères
 *  4. H1 unique sur tout le site
 *  5. mot-clé principal unique — c'est le garde-fou anti-cannibalisation
 *  6. route parente déclarée (cohérence des breadcrumbs)
 */

import { routes } from "../src/lib/routes.ts";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

const errors: string[] = [];
const warnings: string[] = [];

const seenTitles = new Map<string, string>();
const seenH1 = new Map<string, string>();
const seenKeywords = new Map<string, string>();
const declaredPaths = new Set(routes.map((r) => r.path));

for (const route of routes) {
  const at = `[${route.path}]`;

  // 1 & 2 — titles
  if (!route.title.trim()) {
    errors.push(`${at} title vide.`);
  } else {
    const previous = seenTitles.get(route.title);
    if (previous) {
      errors.push(`${at} title identique à ${previous} : « ${route.title} »`);
    }
    seenTitles.set(route.title, route.path);

    if (route.title.length > TITLE_MAX) {
      errors.push(
        `${at} title de ${route.title.length} caractères (max ${TITLE_MAX}) : « ${route.title} »`,
      );
    }
  }

  // 3 — descriptions
  if (!route.description.trim()) {
    errors.push(`${at} meta description vide.`);
  } else if (route.description.length > DESCRIPTION_MAX) {
    errors.push(
      `${at} description de ${route.description.length} caractères (max ${DESCRIPTION_MAX}).`,
    );
  } else if (route.description.length < 70) {
    warnings.push(
      `${at} description courte (${route.description.length} caractères) — occasion manquée.`,
    );
  }

  // 4 — H1
  if (!route.h1.trim()) {
    errors.push(`${at} H1 vide.`);
  } else {
    const previous = seenH1.get(route.h1);
    if (previous) {
      errors.push(`${at} H1 identique à ${previous} : « ${route.h1} »`);
    }
    seenH1.set(route.h1, route.path);
  }

  // 5 — cannibalisation
  if (route.keyword) {
    const normalized = route.keyword.trim().toLowerCase();
    const previous = seenKeywords.get(normalized);
    if (previous) {
      errors.push(
        `${at} CANNIBALISATION : mot-clé « ${route.keyword} » déjà porté par ${previous}.`,
      );
    }
    seenKeywords.set(normalized, route.path);
  }

  // 6 — cohérence de l'arborescence
  if (route.parent && !declaredPaths.has(route.parent)) {
    errors.push(`${at} parent « ${route.parent} » non déclaré dans le registre.`);
  }
}

const published = routes.filter((r) => r.published);

console.log("— Vérification de la matrice SEO Argon —\n");
console.log(`Routes déclarées   : ${routes.length}`);
console.log(`Routes publiées    : ${published.length} (${published.map((r) => r.path).join(", ")})`);
console.log(`Intentions uniques : ${seenKeywords.size}\n`);

for (const warning of warnings) console.log(`AVERTISSEMENT  ${warning}`);
for (const error of errors) console.error(`ERREUR         ${error}`);

if (errors.length) {
  console.error(`\n${errors.length} erreur(s). Corrigez src/lib/routes.ts.`);
  process.exit(1);
}

console.log(
  `\nOK — aucune erreur.${warnings.length ? ` ${warnings.length} avertissement(s).` : ""}`,
);
