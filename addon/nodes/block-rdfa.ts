import { Node as PNode } from 'prosemirror-model';
import { isElement } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import {
  getRdfaAttrs,
  renderRdfaAware,
  sharedRdfaNodeSpec,
} from '@lblod/ember-rdfa-editor/core/schema';
import SayNodeSpec from '../core/say-node-spec';

export const block_rdfa: SayNodeSpec = {
  content: 'block+',
  editable: true,
  group: 'block',
  attrs: {
    properties: { default: [] },
    backlinks: { default: [] },
    resource: { default: null },
    rdfaNodeType: { default: null },
    __rdfaId: { default: null },
  },
  defining: true,
  ...sharedRdfaNodeSpec,
  parseDOM: [
    {
      tag: `p, div, address, article, aside, blockquote, details, dialog, dd, dt, fieldset, figcaption, figure, footer, form, header, hgroup, hr, main, nav, pre, section`,
      // Default priority is 50, so this means a more specific definition matches before this one
      priority: 40,
      getAttrs(node: HTMLElement) {
        if (!getRdfaAttrs(node)) {
          return false;
        }
        return {};
      },
      contentElement(node: Node) {
        if (!isElement(node)) {
          throw new Error('node is not an element');
        }
        for (const child of node.children) {
          if ((child as HTMLElement).dataset.contentContainer) {
            return child as HTMLElement;
          }
        }
        return node;
      },
    },
  ],
  toDOM(node: PNode) {
    const resource = node.attrs.resource as string;
    return renderRdfaAware({
      renderable: node,
      tag: 'div',
      attrs: {
        class: 'say-editable',
        resource,
      },
      content: 0,
    });
  },
};
