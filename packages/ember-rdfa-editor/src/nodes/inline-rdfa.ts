import { Node as PNode } from 'prosemirror-model';
import {
  getRdfaAttrs,
  getRdfaContentElement,
  rdfaAttrSpec,
  renderRdfaAware,
} from '../core/schema.ts';
import {
  type EmberNodeConfig,
  createEmberNodeSpec,
  createEmberNodeView,
} from '../utils/ember-node.ts';
import InlineRdfaComponent from '../components/ember-node/inline-rdfa.gts';
import type { ComponentLike } from '@glint/template';
import getClassnamesFromNode from '../utils/get-classnames-from-node.ts';
import type {
  ModelMigrationGenerator,
  RdfaAttrs,
} from '#root/core/rdfa-types.ts';

type Options = {
  rdfaAware?: boolean;
  /**
   * Migrations to apply to nodes parsed as inline-rdfa, to modify the data model.
   * @returns false to use the default parsing or an object to define overrides
   **/
  modelMigrations?: ModelMigrationGenerator[];
};

const emberNodeConfig: (options?: Options) => EmberNodeConfig = ({
  rdfaAware = false,
  modelMigrations = [],
} = {}) => {
  return {
    name: 'inline-rdfa',
    inline: true,
    component: InlineRdfaComponent as unknown as ComponentLike,
    group: 'inline',
    content: 'inline*',
    atom: true,
    draggable: false,
    selectable: true,
    editable: rdfaAware,
    isolating: rdfaAware,
    classNames: ['say-inline-rdfa'],
    toDOM(node: PNode) {
      if (rdfaAware) {
        return renderRdfaAware({
          renderable: node,
          tag: 'span',
          attrs: { class: getClassnamesFromNode(node) },
          content: 0,
        });
      } else {
        return [
          'span',
          { ...node.attrs, class: getClassnamesFromNode(node) },
          0,
        ];
      }
    },
    parseDOM: [
      {
        tag: 'span',
        // default prio is 50, highest prio comes first, and this parserule should at least come after all other nodes
        priority: 10,
        getAttrs(element: string | HTMLElement) {
          if (typeof element === 'string') {
            return false;
          }
          const attrs = getRdfaAttrs(element, { rdfaAware });
          if (attrs) {
            const migration = modelMigrations.find((migration) =>
              migration(attrs as unknown as RdfaAttrs),
            )?.(attrs as unknown as RdfaAttrs);
            if (migration && migration.getAttrs) {
              return migration.getAttrs(element);
            }
            return attrs;
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
    attrs: rdfaAttrSpec({ rdfaAware }),
  };
};

export const inlineRdfaWithConfig = (options?: Options) =>
  createEmberNodeSpec(emberNodeConfig(options));

export const inlineRdfaWithConfigView = (options?: Options) =>
  createEmberNodeView(emberNodeConfig(options));
