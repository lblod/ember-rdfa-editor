import type { Mark } from 'prosemirror-model';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
} from '../core/schema.ts';
import type SayMarkSpec from '../core/say-mark-spec.ts';
import { v4 as uuidv4 } from 'uuid';

/**
 * @deprecated use `inlineRdfaWithConfig` instead
 */
export const inline_rdfa: SayMarkSpec = {
  attrs: {
    ...rdfaAttrSpec({ rdfaAware: false }),
    _guid: { default: false },
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
        const attrs = getRdfaAttrs(node, { rdfaAware: false });
        if (attrs) {
          return { ...attrs, _guid: uuidv4() };
        }
        return false;
      },
      contentElement: getRdfaContentElement,
    },
  ],
  toDOM(mark: Mark) {
    const { ...rdfaAttrs }: Record<string, unknown> = mark.attrs;
    delete rdfaAttrs['_guid'];
    return ['span', rdfaAttrs, 0];
  },
  hasRdfa: true,
  parseTag: 'span',
};
