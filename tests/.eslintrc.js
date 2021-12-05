module.exports = {
  env: {
    embertest: true,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: ['../tsconfig.json'],
      },
    },
  ],
};
