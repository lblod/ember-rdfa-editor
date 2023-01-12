import { getRdfaAttrs, PNode, rdfaAttrs } from '@lblod/ember-rdfa-editor';
import {
  createEmberNodeSpec,
  createEmberNodeView,
  EmberNodeConfig,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export const emberNodeConfig: EmberNodeConfig = {
  name: 'inline-rdfa',
  componentPath: 'ember-nodes/inline-rdfa',
  inline: true,
  content: 'inline*',
  group: 'inline',
  atom: false,
  isolating: true,
  attrs: {
    ...rdfaAttrs,
    __tag: { default: 'span' },
  },
  parseDOM: [
    {
      tag: 'span, link',
      getAttrs(element: HTMLElement) {
        const rdfaAttrs = getRdfaAttrs(element);
        if (rdfaAttrs) {
          return { __tag: tagName(element), ...rdfaAttrs };
        }
        return false;
      },
    },
  ],
  toDOM(node: PNode) {
    return [node.attrs.__tag, node.attrs, 0];
  },
};
export const inline_rdfa = createEmberNodeSpec(emberNodeConfig);
export const inlineRdfaView = createEmberNodeView(emberNodeConfig);
