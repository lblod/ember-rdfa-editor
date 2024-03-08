import type { Mark } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import { getRdfaContentElement, renderRdfaAware } from '../core/schema';
import type SayMarkSpec from '../core/say-mark-spec';

type Options = {
  rdfaAware?: boolean;
};

export const inline_rdfa: (options?: Options) => SayMarkSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    attrs: rdfaAttrSpec({ rdfaAware }),
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
          const attrs = getRdfaAttrs(node, { rdfaAware });
          if (attrs) {
            return attrs;
          }
          return false;
        },
        contentElement: getRdfaContentElement,
      },
    ],
    toDOM(mark: Mark) {
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: mark,
          tag: 'span',
          content: 0,
        });
      } else {
        return ['span', mark.attrs, 0];
      }
    },
    hasRdfa: true,
    parseTag: 'span',
  };
};
