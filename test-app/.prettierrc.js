'use strict';

module.exports = {
  plugins: ['prettier-plugin-ember-template-tag'],
  overrides: [
    {
      files: '*.html',
      options: {
        htmlWhitespaceSensitivity: 'strict',
      },
    },
    {
      files: '*.{js,gjs,ts,gts,mjs,mts,cjs,cts}',
      options: {
        singleQuote: true,
      },
    },
    {
      files: '*.{gjs,gts}',
      options: {
        singleQuote: true,
        templateSingleQuote: false,
      },
    },
  ],
};
