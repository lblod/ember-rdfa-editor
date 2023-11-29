import { Node as PNode } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs, renderRdfaAware } from '../core/schema';
import {
  EmberNodeConfig,
  createEmberNodeSpec,
  createEmberNodeView,
} from '../utils/ember-node';
import InlineRdfaComponent from '../components/ember-node/inline-rdfa';
import { ComponentLike } from '@glint/template';

const parseDOM = [
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
];
const toDOM = (node: PNode) => {
  return renderRdfaAware({
    renderable: node,
    tag: 'span',
    attrs: { class: 'say-inline-rdfa', ...node.attrs },
    content: 0,
  });
};

const emberNodeConfig: EmberNodeConfig = {
  name: 'inline-rdfa',
  inline: true,
  component: InlineRdfaComponent as unknown as ComponentLike,
  group: 'inline',
  content: 'inline*',
  atom: true,
  editable: true,
  draggable: false,
  selectable: false,
  toDOM,
  parseDOM,
  attrs: {
    ...rdfaAttrs,
  },
};
export const inline_rdfa = createEmberNodeSpec(emberNodeConfig);
export const inlineRdfaView = createEmberNodeView(emberNodeConfig);
