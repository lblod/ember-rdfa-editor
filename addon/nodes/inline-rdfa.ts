import { Mark, MarkSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';

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
        const attrs = getRdfaAttrs(node);
        if (attrs) {
          return attrs;
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
