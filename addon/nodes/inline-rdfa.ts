import { Mark, MarkSpec } from 'prosemirror-model';
import {
  getRdfaAttrs,
  NodeSpec,
  PNode,
  rdfaAttrs,
} from '@lblod/ember-rdfa-editor';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

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
      tag: '*',
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
    return [
      node.attrs.__tag,
      {
        ...node.attrs,
      },
    ];
  },
};
export const inline_rdfa: MarkSpec = {
  attrs: {
    ...rdfaAttrs,
    __tag: { default: 'span' },
  },
  group: 'rdfa',
  excludes: '',
  parseDOM: [
    {
      tag: 'span',
      getAttrs(node: HTMLElement) {
        if (node.hasChildNodes()) {
          const attrs = getRdfaAttrs(node);
          if (attrs) {
            return attrs;
          }
        }
        return false;
      },
    },
  ],
  toDOM(mark: Mark) {
    return ['span', mark.attrs, 0];
  },
  hasRdfa: true,
  parseTag: 'span',
};
export const rdfaLink: MarkSpec = {
  attrs: {
    ...rdfaAttrs,
    __tag: { default: 'span' },
  },
  group: 'rdfa',
  excludes: '',
  parseDOM: [
    {
      tag: 'link',
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node);
        if (attrs) {
          return attrs;
        }
        return false;
      },
    },
  ],
  toDOM(mark: Mark) {
    return ['link', mark.attrs, 0];
  },
  hasRdfa: true,
  parseTag: 'link',
};
