'use strict';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true
    }

  },
  plugins: [
    'ember',
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
  ],
  env: {
    browser: true
  },
  rules: {
    'ember/no-jquery': 'error',
    'semi': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: true,
        node: true
      },
      plugins: ['node'],
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      })
    },
    // typescript
    {
      "files": ["**/*.ts", "**/*.tsx"],
      extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        'ember/no-jquery': 'error',
        'semi': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error'
      },
    }
  ]
};
