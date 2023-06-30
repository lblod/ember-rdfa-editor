import { NodeSpec } from 'prosemirror-model';

interface DocumentConfig {
  defaultLanguage?: string;
  content?: string;
}

// Note: the `doc` node-spec does not have any parsing rules, as the parsing of the doc node is done in the `initalize` method
// of the `SayController` class.
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
    toDOM(node) {
      return [
        'div',
        { lang: node.attrs.lang as string, 'data-say-document': true },
        0,
      ];
    },
  };
};
