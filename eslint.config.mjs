import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    ignores: ['node_modules', 'playwright-report', 'test-results', 'blob-report'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Keep type-only imports separate from value imports for a clearer module graph.
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
  },
);
