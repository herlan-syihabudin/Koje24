import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  
  {
    rules: {
      // 🔥 CONSOLE & DEBUG
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "warn",
      
      // 🔥 NEXT.JS SPECIFIC
      "@next/next/no-img-element": "error",
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-css-tags": "error",
      
      // 🔥 REACT HOOKS
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // 🔥 CODE QUALITY
      "prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      
      // 🔥 RESTRICTED IMPORTS (biar gak pake library berat)
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            "lodash",
            "lodash/*",
            "moment",
            "moment/*"
          ]
        }
      ],
    },
  },
  
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "dist/**",
    "*.config.js",
    "*.config.ts",
    ".vercel/**",
  ]),
]);

export default eslintConfig;
