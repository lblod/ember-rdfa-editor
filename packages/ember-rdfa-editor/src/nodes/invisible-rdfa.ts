import { tagName } from '#root/utils/_private/dom-helpers.ts';
import type SayNodeSpec from '../core/say-node-spec.ts';
import {
  getRdfaAttrs,
  type RdfaAttrs,
  rdfaAttrSpec,
  renderInvisibleRdfa,
  renderRdfaAttrs,
} from '../core/schema.ts';
import getClassnamesFromNode from '../utils/get-classnames-from-node.ts';
import { PNode } from '#root/prosemirror-aliases.ts';

type Options = {
  rdfaAware?: boolean;
};

export const invisibleRdfaWithConfig: (options?: Options) => SayNodeSpec = ({
  rdfaAware = false,
} = {}) => {
  return {
    inline: true,
    group: 'inline',
    atom: true,
    defining: true,
    isolating: true,
    classNames: ['say-invisible-rdfa'],
    attrs: {
      ...rdfaAttrSpec({ rdfaAware }),
      __tag: { default: 'span' },
    },
    parseDOM: [
      {
        tag: 'span, link',
        getAttrs(node: string | HTMLElement) {
          if (typeof node === 'string') {
            return false;
          }
          if (!node.hasChildNodes()) {
            const attrs = getRdfaAttrs(node, { rdfaAware });
            if (attrs) {
              return {
                ...attrs,
                __tag: tagName(node),
              };
            }
          }
          return false;
        },
      },
    ],
    toDOM(node: PNode) {
      const { __tag, ...attrs } = node.attrs;
      if (rdfaAware) {
        return [
          __tag,
          {
            ...renderRdfaAttrs(attrs as RdfaAttrs),
            class: getClassnamesFromNode(node),
          },
          renderInvisibleRdfa(node, 'span'),
        ];
      } else {
        return [__tag, attrs];
      }
    },
  };
};

/**
 * @deprecated use `invisibleRdfaWithConfig` instead
 */
export const invisible_rdfa = invisibleRdfaWithConfig();
