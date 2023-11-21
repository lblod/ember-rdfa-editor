import { Mark, MarkSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';

export const inline_rdfa: MarkSpec = {
  attrs: {
    ...rdfaAttrs,
    _guid: { default: null },
  },
  group: 'rdfa',
  excludes: '',
  parseDOM: [
    {
      tag: 'span',
      // default prio is 50, highest prio comes first, and this parserule should at least come after all other nodes
      priority: 10,
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node);
        if (attrs) {
          return { ...attrs, _guid: uuidv4() };
        }
        return false;
      },
    },
  ],
  toDOM(mark: Mark) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _guid, ...rdfaAttrs } = mark.attrs;
    return ['span', rdfaAttrs, 0];
  },
  hasRdfa: true,
  parseTag: 'span',
};
