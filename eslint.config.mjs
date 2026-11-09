import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The retained encrypted-document API predates strict document types.
    // Track its existing dynamic types as warnings while preserving all other lint checks.
    files: ["components/protect.tsx", "components/production.tsx", "components/pilot.tsx", "components/workspace/extras.tsx", "app/api/protect/route.ts", "app/api/complaints/route.ts", "app/api/evidence/route.ts", "lib/live.ts", "lib/pilot.ts"],
    rules: {"@typescript-eslint/no-explicit-any": "warn"},
  },
  globalIgnores([
    "dist/**",
    ".vinext/**",
    ".wrangler/**",
    ".sites-runtime/**",
    "outputs/**",
    "work/**",
  ]),
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.ts"],
    rules: {
      // These files are vendored verbatim from shadcn@4.17.0. Keep the
      // registry source intact while applying the stricter rules to Site code.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
