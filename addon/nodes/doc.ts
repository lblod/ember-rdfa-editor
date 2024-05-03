import type SayNodeSpec from '../core/say-node-spec';
import { isElement } from '../utils/_private/dom-helpers';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
  renderRdfaAware,
} from '../core/schema';
import type { AttributeSpec } from 'prosemirror-model';

interface DocumentConfig {
  defaultLanguage?: string;
  content?: string;
  rdfaAware?: boolean;
  extraAttributes?: Record<string, AttributeSpec>;
}

// Note: the `doc` node-spec does not have any parsing rules, as the parsing of the doc node is done in the `initalize` method
// of the `SayController` class.
export const docWithConfig = ({
  defaultLanguage = 'nl-BE',
  content = 'block+',
  rdfaAware = false,
  extraAttributes = {},
}: DocumentConfig = {}): SayNodeSpec => {
  return {
    content,
    get attrs() {
      const baseAttrs = {
        lang: {
          default: defaultLanguage,
          editable: true,
        },
        ...extraAttributes,
      };
      if (rdfaAware) {
        return {
          ...rdfaAttrSpec({ rdfaAware }),
          ...baseAttrs,
        };
      } else {
        return baseAttrs;
      }
    },
    editable: rdfaAware,
    isolating: rdfaAware,
    selectable: rdfaAware,
    parseDOM: [
      {
        tag: 'div',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          if (node.dataset['sayDocument']) {
            const extraAttrs: Record<string, unknown> = {};
            Object.keys(extraAttributes).forEach((attr) => {
              extraAttrs[attr] = node.getAttribute(attr);
            });
            if (rdfaAware) {
              return {
                ...extraAttrs,
                lang: node.getAttribute('lang'),
                ...getRdfaAttrs(node, { rdfaAware: true }),
              };
            } else {
              return {
                ...extraAttrs,
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
          if (rdfaAware) {
            return getRdfaContentElement(node);
          }
          return node;
        },
      },
    ],
    toDOM(node) {
      const attrs: Record<string, unknown> = {
        lang: node.attrs['lang'] as string,
        'data-say-document': true,
      };
      Object.keys(extraAttributes).forEach((attr) => {
        attrs[attr] = node.attrs[attr];
      });
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

/**
 * @deprecated use `docWithConfig` instead
 */
export const doc = docWithConfig();
