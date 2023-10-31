import { MarkSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';

export const link: MarkSpec = {
  attrs: {
    ...rdfaAttrs,
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
    return ['a', { target: '_blank', ...mark.attrs }, 0];
  },
  hasRdfa: true,
  parseTag: 'a',
};
