import { Node as PNode } from 'prosemirror-model';
import {
  classicRdfaAttrSpec,
  getClassicRdfaAttrs,
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
  renderRdfaAware,
} from '@lblod/ember-rdfa-editor/core/schema';
import type SayNodeSpec from '../core/say-node-spec';

type Config = {
  rdfaAware?: boolean;
};

export const block_rdfa: (config?: Config) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    content: 'block+',
    group: 'block',
    get attrs() {
      if (rdfaAware) {
        return rdfaAttrSpec;
      } else {
        return classicRdfaAttrSpec;
      }
    },
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
          const attrs = rdfaAware
            ? getRdfaAttrs(node)
            : getClassicRdfaAttrs(node);
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
