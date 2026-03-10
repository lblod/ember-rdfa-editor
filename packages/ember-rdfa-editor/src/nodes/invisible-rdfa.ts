import { tagName } from '#root/utils/_private/dom-helpers.ts';
import type SayNodeSpec from '../core/say-node-spec.ts';
import { type ModelMigrationGenerator, type RdfaAttrs } from '../core/rdfa-types.ts';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
  renderInvisibleRdfa,
  renderRdfaAttrs,
} from '../core/schema.ts';
import getClassnamesFromNode from '../utils/get-classnames-from-node.ts';
import { PNode } from '#root/prosemirror-aliases.ts';

type Options = {
  rdfaAware?: boolean;
  /**
   * Migrations to apply to nodes parsed as block-rdfa, to modify the data model.
   * @returns false to use the default parsing or an object to define overrides
   **/
  modelMigrations?: ModelMigrationGenerator[];
};

export const invisibleRdfaWithConfig: (options?: Options) => SayNodeSpec = ({
  rdfaAware = false,
  modelMigrations = [],
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
            let attrs = getRdfaAttrs(node, { rdfaAware });
            if (attrs) {
              attrs = {
                ...attrs,
                __tag: tagName(node),
              };
              const migration = modelMigrations.find((migration) =>
                migration(attrs as unknown as RdfaAttrs),
              )?.(attrs as unknown as RdfaAttrs);
              if (migration && migration.getAttrs) {
                return migration.getAttrs(node);
              }
              return attrs;
            }
          }
          return false;
        },
        contentElement: (element) => {
          if (rdfaAware && modelMigrations.length > 0) {
            const attrs = getRdfaAttrs(element, { rdfaAware });
            if (attrs) {
              const migration = modelMigrations.find((migration) =>
                migration(attrs as unknown as RdfaAttrs),
              )?.(attrs as unknown as RdfaAttrs);
              if (migration && migration.contentElement) {
                return migration.contentElement(element);
              }
            }
          }
          return getRdfaContentElement(element);
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
