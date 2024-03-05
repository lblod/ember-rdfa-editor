import type { DOMOutputSpec, Node as PNode } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import type SayNodeSpec from '../core/say-node-spec';
import {
  classicRdfaAttrSpec,
  getClassicRdfaAttrs,
  getRdfaContentElement,
  renderRdfaAware,
} from '../core/schema';

type Options = {
  rdfaAware?: boolean;
};

export const repaired_block: (options?: Options) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    inline: true,
    content: 'inline*',
    group: 'inline',
    get attrs() {
      if (rdfaAware) {
        return rdfaAttrSpec;
      } else {
        return classicRdfaAttrSpec;
      }
    },
    // defining: true,
    parseDOM: [
      {
        tag: 'p, div, h1, h2, h3, h4, h5, h6, address, article, aside, blockquote, details, dialog, dd, dt, fieldset, figcaption, figure, footer, form, header, hgroup, hr, main, nav, pre, section',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          if (rdfaAware) {
            return {
              ...getRdfaAttrs(node),
            };
          } else {
            return {
              ...getClassicRdfaAttrs(node),
            };
          }
        },
        contentElement: getRdfaContentElement,
        context: 'inline/',
      },
    ],
    toDOM(node: PNode): DOMOutputSpec {
      if (rdfaAware) {
        return renderRdfaAware({ renderable: node, tag: 'span', content: 0 });
      } else {
        return ['span', { ...node.attrs }, 0];
      }
    },
  };
};
