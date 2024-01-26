import type { Mark, MarkSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import { renderRdfaAware } from '../core/schema';

export const inline_rdfa: MarkSpec = {
  attrs: {
    ...rdfaAttrSpec,
  },
  group: 'rdfa',
  excludes: '',
  parseDOM: [
    {
      tag: 'span',
      // default prio is 50, highest prio comes first, and this parserule should at least come after all other nodes
      priority: 10,
      getAttrs(node: string | HTMLElement) {
        if (typeof node === 'string') {
          return false;
        }
        const attrs = getRdfaAttrs(node);
        if (attrs) {
          return attrs;
        }
        return false;
      },
    },
  ],
  toDOM(mark: Mark) {
    const resource = mark.attrs['resource'] as string;
    return renderRdfaAware({
      renderable: mark,
      tag: 'span',
      attrs: {
        resource,
      },
      content: 0,
    });
  },
  hasRdfa: true,
  parseTag: 'span',
};
