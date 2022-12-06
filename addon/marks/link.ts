import { MarkSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';

export const link: MarkSpec = {
  attrs: {
    ...rdfaAttrs,
  },
  excludes: 'linkmarks',
  group: 'linkmarks',
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs(dom: HTMLElement) {
        return {
          ...getRdfaAttrs(dom),
        };
      },
    },
  ],
  toDOM(node) {
    return ['a', { ...node.attrs }, 0];
  },
};
