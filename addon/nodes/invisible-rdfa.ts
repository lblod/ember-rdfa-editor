import {
  getRdfaAttrs,
  NodeSpec,
  PNode,
  rdfaAttrs,
} from '@lblod/ember-rdfa-editor';
import { tagName } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';

export const invisible_rdfa: NodeSpec = {
  inline: true,
  group: 'inline',
  atom: true,
  defining: true,
  isolating: true,
  attrs: {
    ...rdfaAttrs,
    __tag: { default: 'span' },
  },
  parseDOM: [
    {
      tag: 'span, link',
      getAttrs(node: HTMLElement) {
        if (!node.hasChildNodes()) {
          const attrs = getRdfaAttrs(node);
          if (attrs) {
            return {
              ...attrs,
              __tag: tagName(node),
            };
          }
        }
        return false;
      },
    },
  ],
  toDOM(node: PNode) {
    const { __tag, ...attrs } = node.attrs;
    return [__tag, attrs];
  },
};
