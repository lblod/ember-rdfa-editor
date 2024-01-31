import { AttributeSpec } from 'prosemirror-model';
import SayNodeSpec from '../core/say-node-spec';
import { isElement } from '../utils/_private/dom-helpers';
import { getRdfaAttrs, rdfaAttrSpec, renderRdfaAware } from '../core/schema';

interface DocumentConfig {
  defaultLanguage?: string;
  content?: string;
  extraAttributes?: Record<string, AttributeSpec>;
}

// Note: the `doc` node-spec does not have any parsing rules, as the parsing of the doc node is done in the `initalize` method
// of the `SayController` class.
export const docWithConfig = ({
  defaultLanguage = 'nl-BE',
  content = 'block+',
}: DocumentConfig = {}): SayNodeSpec => {
  const attrs: SayNodeSpec['attrs'] = {
    lang: {
      default: defaultLanguage,
      editable: true,
    },
    ...rdfaAttrSpec,
  };

  return {
    content,
    attrs,
    editable: true,
    parseDOM: [
      {
        tag: 'div',
        getAttrs(node: HTMLElement) {
          if (node.dataset.sayDocument) {
            return {
              lang: node.getAttribute('lang'),
              ...getRdfaAttrs(node),
            };
          } else {
            return false;
          }
        },
        contentElement(node: Node) {
          if (!isElement(node)) {
            throw new Error('node is not an element');
          }
          const result: HTMLElement =
            node.querySelector('[data-content-container="true"]') ?? node;
          console.log(result);
          return result;
        },
      },
    ],
    toDOM(node) {
      const lang = node.attrs.lang as string;
      return renderRdfaAware({
        renderable: node,
        tag: 'div',
        attrs: {
          lang,
          'data-say-document': true,
        },
        content: 0,
      });
    },
  };
};

export const doc = docWithConfig();
