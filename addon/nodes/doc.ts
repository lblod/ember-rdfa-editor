import { AttributeSpec, NodeSpec } from 'prosemirror-model';

interface DocumentConfig {
  defaultLanguage?: string;
  content?: string;
  extraAttributes?: Record<string, AttributeSpec>;
}

// Note: the `doc` node-spec does not have any parsing rules, as the parsing of the doc node is done in the `initalize` method
// of the `SayController` class.
export const docWithConfig: (config?: DocumentConfig) => NodeSpec = ({
  defaultLanguage = 'nl-BE',
  content = 'block+',
  extraAttributes = [],
} = {}) => {
  const attrs: NodeSpec['attrs'] = {
    lang: {
      default: defaultLanguage,
    },
  };

  Object.entries(extraAttributes).forEach(([attributeName, value]) => {
    attrs[attributeName] = value;
  });

  return {
    content,
    attrs,
    toDOM(node) {
      const toDOMAttributes: Record<string, unknown> = {
        lang: node.attrs.lang as string,
        'data-say-document': true,
      };

      Object.keys(extraAttributes).forEach((attr) => {
        toDOMAttributes[attr] = node.attrs[attr];
      });

      return ['div', toDOMAttributes, 0];
    },
  };
};

export const doc = docWithConfig();
