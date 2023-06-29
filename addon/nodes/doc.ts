import { NodeSpec } from 'prosemirror-model';

interface DocumentConfig {
  defaultLanguage?: string;
}

export const doc: (config?: DocumentConfig) => NodeSpec = ({
  defaultLanguage = 'nl-BE',
  content = 'block+',
} = {}) => {
  return {
    content,
    attrs: {
      lang: {
        default: defaultLanguage,
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
      return [
        'div',
        { lang: node.attrs.lang as string, 'data-say-document': true },
        0,
      ];
    },
  };
};
