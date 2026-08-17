/**
 * Construit et assemble le paquet de déploiement, sur tout système.
 *
 *   node --experimental-strip-types scripts/deploy.ts          → site FERMÉ
 *   node --experimental-strip-types scripts/deploy.ts --ouvrir  → site OUVERT
 *
 * Passe habituellement par npm : `npm run deploy:build` / `npm run deploy:ouvrir`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI CE SCRIPT PLUTÔT QU'UNE LIGNE DANS package.json
 *
 * La forme `VAR=valeur commande` est une syntaxe de shell Unix. Sous Windows,
 * ni PowerShell ni cmd ne la comprennent : la commande échoue, ou pire, elle
 * s'exécute en ignorant la variable — un build silencieusement configuré à
 * l'envers. Or c'est exactement la commande qui décide si le site est ouvert
 * ou fermé aux moteurs de recherche : elle ne peut pas dépendre du terminal
 * dans lequel on se trouve.
 *
 * Node lance donc lui-même les sous-processus avec le bon environnement, ce
 * qui fonctionne identiquement sous Windows, macOS et Linux. Aucune
 * dépendance ajoutée : le projet reste à zéro dépendance runtime.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");

const ouvert = process.argv.includes("--ouvrir");

/** Environnement imposé aux deux étapes, identique pour l'une et pour l'autre. */
const environnement = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: "https://www.argon-mobility.com",
  NEXT_PUBLIC_SITE_OPEN: ouvert ? "true" : "false",
};

console.log(
  `\n▸ Construction du site — moteurs de recherche : ${ouvert ? "OUVERT" : "FERMÉ"}\n`,
);

if (ouvert) {
  console.log("  ⚠️  Ce paquet rendra le site indexable par Google.");
  console.log("      À n'utiliser qu'une fois les mentions légales publiées.\n");
}

/**
 * `shell: true` est nécessaire sous Windows pour retrouver les exécutables
 * installés par npm (next.cmd, et non next). `stdio: "inherit"` laisse passer
 * la sortie des sous-processus en direct, sans la tamponner.
 */
function executer(commande: string, arguments_: string[]): void {
  const resultat = spawnSync(commande, arguments_, {
    cwd: RACINE,
    env: environnement,
    stdio: "inherit",
    shell: true,
  });

  if (resultat.status !== 0) {
    process.exit(resultat.status ?? 1);
  }
}

executer("next", ["build"]);
executer("node", ["--experimental-strip-types", "scripts/prepare-deploy.ts"]);
