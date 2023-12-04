import { MarkSpec } from 'prosemirror-model';
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
      getAttrs(dom: HTMLElement) {
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
