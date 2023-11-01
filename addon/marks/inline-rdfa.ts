import { Mark, MarkSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';
import { renderRdfaAware } from '../core/schema';

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
      // default prio is 50, highest prio comes first, and this parserule should at least come after all other nodes
      priority: 10,
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
    return renderRdfaAware({
      renderable: mark,
      tag: 'span',
      attrs: mark.attrs,
      content: 0,
    });
  },
  hasRdfa: true,
  parseTag: 'span',
};
