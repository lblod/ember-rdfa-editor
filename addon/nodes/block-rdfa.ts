import { Node as PNode } from 'prosemirror-model';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
  renderRdfaAware,
  sharedRdfaNodeSpec,
} from '@lblod/ember-rdfa-editor/core/schema';
import SayNodeSpec from '../core/say-node-spec';

export const block_rdfa: SayNodeSpec = {
  content: 'block+',
  editable: true,
  group: 'block',
  attrs: {
    ...rdfaAttrSpec,
  },
  defining: true,
  ...sharedRdfaNodeSpec,
  parseDOM: [
    {
      tag: `p, div, address, article, aside, blockquote, details, dialog, dd, dt, fieldset, figcaption, figure, footer, form, header, hgroup, hr, main, nav, pre, section`,
      // Default priority is 50, so this means a more specific definition matches before this one
      priority: 40,
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node);
        if (attrs) {
          return attrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
  ],
  toDOM(node: PNode) {
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        class: 'say-editable',
      },
      content: 0,
    });
  },
};
