/*
eslint.config.mjs | ESLint configuration | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;

/* - - - - - - - - - - - - - - - - */
