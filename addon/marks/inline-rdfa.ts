import type { Mark } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrSpec } from '@lblod/ember-rdfa-editor';
import { getRdfaContentElement } from '../core/schema';
import type SayMarkSpec from '../core/say-mark-spec';

/**
 * @deprecated use `inlineRdfaWithConfig` instead
 */
export const inline_rdfa: SayMarkSpec = {
  attrs: rdfaAttrSpec({ rdfaAware: false }),
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
        const attrs = getRdfaAttrs(node, { rdfaAware: false });
        if (attrs) {
          return attrs;
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
  ],
  toDOM(mark: Mark) {
    return ['span', mark.attrs, 0];
  },
  hasRdfa: true,
  parseTag: 'span',
};
