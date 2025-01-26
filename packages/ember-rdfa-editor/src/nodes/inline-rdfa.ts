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
import InlineRdfaComponent from '../components/ember-node/inline-rdfa.ts';
import type { ComponentLike } from '@glint/template';
import getClassnamesFromNode from '../utils/get-classnames-from-node.ts';

type Options = {
  rdfaAware?: boolean;
};

const emberNodeConfig: (options?: Options) => EmberNodeConfig = ({
  rdfaAware = false,
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
    attrs: rdfaAttrSpec({ rdfaAware }),
  };
};

export const inlineRdfaWithConfig = (options?: Options) =>
  createEmberNodeSpec(emberNodeConfig(options));

export const inlineRdfaWithConfigView = (options?: Options) =>
  createEmberNodeView(emberNodeConfig(options));
