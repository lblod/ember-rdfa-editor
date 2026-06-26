import { type Config } from 'prettier';
const config: Config = {
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  overrides: [
    {
      files: '*.jsonc',
      options: {
        trailingComma: 'none',
      },
    },
  ],
};
export default config;
