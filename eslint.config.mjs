/*
eslint.config.mjs | ESLint configuration | Sree | 2026-06-09
*/

/* - - - - - - - - - - - - - - - - */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**"]),
]);

export default eslintConfig;

/* - - - - - - - - - - - - - - - - */
