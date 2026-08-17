import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Convention du projet : un identifiant préfixé par « _ » est
      // volontairement inutilisé (variable extraite d'un rest spread).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    // Sorties de build : `out/` est l'export statique brut, `dist/` le paquet
    // assemblé pour OVH. Les linter sur du JS minifié produit par Turbopack
    // n'a aucun sens et noie les vraies erreurs sous des milliers d'alertes.
    "out/**",
    "dist/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
