import { tagName } from '#root/utils/_private/dom-helpers.ts';
import type SayNodeSpec from '../core/say-node-spec.ts';
import {
  type ModelMigrationGenerator,
  type RdfaAttrs,
} from '../core/rdfa-types.ts';
import {
  getRdfaAttrs,
  rdfaAttrSpec,
  renderInvisibleRdfa,
  renderRdfaAttrs,
} from '../core/schema.ts';
import getClassnamesFromNode from '../utils/get-classnames-from-node.ts';
import {
  contentElementWithMigrations,
  getAttrsWithMigrations,
} from '#root/core/schema/_private/migrations.ts';

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
        getAttrs(element: string | HTMLElement) {
          if (typeof element === 'string') {
            return false;
          }
          if (!element.hasChildNodes()) {
            let attrs = getRdfaAttrs(element, { rdfaAware });
            if (attrs) {
              attrs = {
                ...attrs,
                __tag: tagName(element),
              };
              return getAttrsWithMigrations(modelMigrations, attrs, element);
            }
          }
          return false;
        },
        contentElement: (element) => {
          return contentElementWithMigrations(
            modelMigrations,
            rdfaAware,
            element,
          );
        },
      },
    ],
    toDOM(node, state) {
      const { __tag, ...attrs } = node.attrs;
      if (rdfaAware) {
        return [
          __tag,
          {
            ...renderRdfaAttrs(attrs as RdfaAttrs),
            class: getClassnamesFromNode(node),
          },
          renderInvisibleRdfa(
            { renderable: node, rdfaContainerTag: 'span' },
            state,
          ),
        ];
      } else {
        return [__tag, attrs];
      }
    },
  } satisfies SayNodeSpec;
};

/**
 * @deprecated use `invisibleRdfaWithConfig` instead
 */
export const invisible_rdfa = invisibleRdfaWithConfig();
