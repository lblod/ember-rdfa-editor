import type { MarkSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';

export const link: MarkSpec = {
  attrs: {
    ...rdfaAttrSpec,
  },
  excludes: '',
  group: 'rdfa linkmarks',
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs(dom: string | HTMLElement) {
        if (typeof dom === 'string') {
          return false;
        }
        return {
          ...getRdfaAttrs(dom),
        };
      },
    },
  ],
  toDOM(mark) {
    return ['a', mark.attrs, 0];
  },
  hasRdfa: true,
  parseTag: 'a',
};
