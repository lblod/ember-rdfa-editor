import { Node as PNode } from 'prosemirror-model';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import type SayNodeSpec from '../core/say-node-spec';

type Config = {
  rdfaAware?: boolean;
};

export const blockRdfaWithConfig: (config?: Config) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    content: 'block+',
    group: 'block',
    attrs: rdfaAttrSpec({ rdfaAware }),
    defining: true,
    parseDOM: [
      {
        tag: `p, div, address, article, aside, blockquote, details, dialog, dd, dt, fieldset, figcaption, figure, footer, form, header, hgroup, hr, main, nav, pre, section`,
        // Default priority is 50, so this means a more specific definition matches before this one
        priority: 40,
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          const attrs = getRdfaAttrs(node, { rdfaAware });
          if (attrs) {
            return attrs;
          }
          return false;
        },
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(node: PNode) {
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: node,
          tag: 'div',
          attrs: {
            class: 'say-editable',
          },
          content: 0,
        });
      } else {
        return ['div', node.attrs, 0];
      }
    },
  };
};

/**
 * @deprecated use `blockRdfaWithConfig` instead
 */
export const block_rdfa = blockRdfaWithConfig();
