import { NodeSpec } from 'prosemirror-model';

interface DocumentConfig {
  defaultLanguage: string;
}

export const doc: (config: DocumentConfig) => NodeSpec = (
  config = {
    defaultLanguage: 'nl-BE',
  }
) => {
  return {
    content: 'block+',
    attrs: {
      lang: {
        default: config.defaultLanguage,
      },
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(node: HTMLElement) {
          return {
            lang: node.getAttribute('lang'),
          };
        },
      },
    ],
    toDOM(node) {
      return ['div', { lang: node.attrs.lang as string }, 0];
    },
  };
};
