import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // The site intentionally uses plain <img> throughout: SVG illustrations and
      // dynamic external service logos (no known dimensions), and we prioritise the
      // broadest possible browser compatibility over the next/image optimizer.
      "@next/next/no-img-element": "off",
      // React Compiler rules (via eslint-plugin-react-hooks, bundled by
      // eslint-config-next 16). Re-enabled as warnings: they flag 9 real spots
      // in the interactive map/navigation code (setState-in-effect, a Math.random
      // in render, two use-before-declare). These need per-case review + map QA
      // before refactoring, so they're surfaced as warnings rather than blocking.
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      // Allow intentionally-unused identifiers prefixed with `_` (args, vars, caught errors).
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
];

export default eslintConfig;
