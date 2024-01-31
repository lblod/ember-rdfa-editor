import {
  getRdfaAttrs,
  type NodeSpec,
  PNode,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor';
import { tagName } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';

export const invisible_rdfa: NodeSpec = {
  inline: true,
  group: 'inline',
  atom: true,
  defining: true,
  isolating: true,
  attrs: {
    ...rdfaAttrSpec,
    __tag: { default: 'span' },
  },
  parseDOM: [
    {
      tag: 'span, link',
      getAttrs(node: string | HTMLElement) {
        if (typeof node === 'string') {
          return false;
        }
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
