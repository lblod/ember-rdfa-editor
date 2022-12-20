import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';

export const heading: NodeSpec = {
  attrs: { level: { default: 1 }, ...rdfaAttrs },
  content: 'inline*',
  group: 'block',
  defining: true,
  parseDOM: [
    {
      tag: 'h1',
      getAttrs(node: HTMLElement) {
        return { level: 1, ...getRdfaAttrs(node) };
      },
    },
    {
      tag: 'h2',
      getAttrs(node: HTMLElement) {
        return { level: 2, ...getRdfaAttrs(node) };
      },
    },
    {
      tag: 'h3',
      getAttrs(node: HTMLElement) {
        return { level: 3, ...getRdfaAttrs(node) };
      },
    },
    {
      tag: 'h4',
      getAttrs(node: HTMLElement) {
        return { level: 4, ...getRdfaAttrs(node) };
      },
    },
    {
      tag: 'h5',
      getAttrs(node: HTMLElement) {
        return { level: 5, ...getRdfaAttrs(node) };
      },
    },
    {
      tag: 'h6',
      getAttrs(node: HTMLElement) {
        return { level: 6, ...getRdfaAttrs(node) };
      },
    },
  ],
  toDOM(node: PNode) {
    return [`h${(node.attrs.level as number).toString()}`, node.attrs, 0];
  },
};
