import type SayNodeSpec from '../core/say-node-spec';
import { isElement } from '../utils/_private/dom-helpers';
import { getRdfaAttrs, rdfaAttrSpec, renderRdfaAware } from '../core/schema';

interface DocumentConfig {
  defaultLanguage?: string;
  content?: string;
  rdfaAware?: boolean;
}

// Note: the `doc` node-spec does not have any parsing rules, as the parsing of the doc node is done in the `initalize` method
// of the `SayController` class.
export const doc = ({
  defaultLanguage = 'nl-BE',
  content = 'block+',
  rdfaAware = false,
}: DocumentConfig = {}): SayNodeSpec => {
  return {
    content,
    get attrs() {
      const baseAttrs = {
        lang: {
          default: defaultLanguage,
          editable: true,
        },
      };
      if (rdfaAware) {
        return {
          ...rdfaAttrSpec,
          ...baseAttrs,
        };
      } else {
        return baseAttrs;
      }
    },
    parseDOM: [
      {
        tag: 'div',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          if (node.dataset['sayDocument']) {
            if (rdfaAware) {
              return {
                lang: node.getAttribute('lang'),
                ...getRdfaAttrs(node),
              };
            } else {
              return {
                lang: node.getAttribute('lang'),
              };
            }
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
          return result;
        },
      },
    ],
    toDOM(node) {
      const attrs = {
        lang: node.attrs['lang'] as string,
        'data-say-document': true,
      };
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: node,
          tag: 'div',
          attrs,
          content: 0,
        });
      } else {
        return ['div', attrs, 0];
      }
    },
  };
};
