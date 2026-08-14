/**
 * Debugging:
 *   https://eslint.org/docs/latest/use/configure/debug
 *  ----------------------------------------------------
 *
 *   Print a file's calculated configuration
 *
 *     npx eslint --print-config path/to/file.js
 *
 *   Inspecting the config
 *
 *     npx eslint --inspect-config
 *
 */
import babelParser from '@babel/eslint-parser/experimental-worker';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
//@ts-expect-error no types
import ember from 'eslint-plugin-ember/recommended';
import importPlugin from 'eslint-plugin-import';
import n from 'eslint-plugin-n';
import globals from 'globals';
import ts from 'typescript-eslint';

const esmParserOptions = {
  ecmaFeatures: { modules: true },
  ecmaVersion: 'latest',
};

const tsParserOptions = (rootDir: string) => ({
  projectService: true,
  tsconfigRootDir: rootDir,
});

function config(tsconfigRootDir: string): ReturnType<typeof defineConfig> {
  return defineConfig(
    globalIgnores(['dist/', 'dist-*/', 'vendor/', 'declarations/', 'coverage/', '!**/.*']),
    js.configs.recommended,
    prettier,
    ember.configs.base,
    ember.configs.gjs,
    ember.configs.gts,
    {
      linterOptions: {
        reportUnusedDisableDirectives: 'error',
      },
    },
    {
      files: ['**/*.js'],
      languageOptions: {
        // @ts-expect-error some internal type mismatch
        parser: babelParser,
      },
    },
    {
      files: ['**/*.{js,gjs}'],
      languageOptions: {
        parserOptions: esmParserOptions,
        globals: {
          ...globals.browser,
        },
      },
    },
    {
      files: ['**/*.{ts,gts}'],
      languageOptions: {
        parser: ember.parser,
        parserOptions: tsParserOptions(tsconfigRootDir),
      },
      extends: [
        ...ts.configs.recommendedTypeChecked,
        {
          ...ts.configs.eslintRecommended,
          files: undefined,
        },
        ember.configs.gts,
      ],

      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
    {
      files: ['src/**/*'],
      plugins: {
        import: importPlugin,
      },
      rules: {
        // require relative imports use full extensions
        'import/extensions': ['error', 'always', { ignorePackages: true }],
      },
    },
    /**
     * CJS node files
     */
    {
      files: [
        '**/*.cjs',
        '.prettierrc.js',
        '.stylelintrc.js',
        '.template-lintrc.js',
        'addon-main.cjs',
      ],
      plugins: {
        n,
      },

      languageOptions: {
        sourceType: 'script',
        ecmaVersion: 'latest',
        globals: {
          ...globals.node,
        },
      },
    },
    /**
     * ESM node files
     */
    {
      files: ['**/*.mjs'],
      plugins: {
        n,
      },

      languageOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        parserOptions: esmParserOptions,
        globals: {
          ...globals.node,
        },
      },
    },
  );
}
export default config;
