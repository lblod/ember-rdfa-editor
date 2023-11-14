import { Node as PNode } from 'prosemirror-model';
import {
  isElement,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import { renderRdfaAware } from '@lblod/ember-rdfa-editor/core/schema';
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
    __tag: { default: 'div' },
  },
  defining: true,
  parseDOM: [
    {
      tag: `p, div, address, article, aside, blockquote, details, dialog, dd, dt, fieldset, figcaption, figure, footer, form, header, hgroup, hr, main, nav, pre, section`,
      getAttrs(node: HTMLElement) {
        return { __tag: tagName(node) };
      },
      contentElement(node: Node) {
        if (!isElement(node)) {
          throw new Error('node is not an element');
        }
        for (const child of node.children) {
          if ((child as HTMLElement).dataset.contentContainer) {
            console.log('found child', child, 'for node', node);
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
