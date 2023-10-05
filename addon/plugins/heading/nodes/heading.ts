import { Node as PNode } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor';
import { optionMapOr } from '@lblod/ember-rdfa-editor/utils/_private/option';
import SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';

export const heading: SayNodeSpec = {
  attrs: {
    level: { default: 1 },
    indentationLevel: { default: 0 },
    ...rdfaAttrs,
  },
  content: 'inline*',
  group: 'block',
  editable: true,
  defining: true,
  parseDOM: [
    {
      tag: 'h1',
      getAttrs(node: HTMLElement) {
        return {
          level: 1,
          indentationLevel: optionMapOr(
            0,
            parseInt,
            node.dataset.indentationLevel,
          ),
          ...getRdfaAttrs(node),
        };
      },
    },
    {
      tag: 'h2',
      getAttrs(node: HTMLElement) {
        return {
          level: 2,
          indentationLevel: optionMapOr(
            0,
            parseInt,
            node.dataset.indentationLevel,
          ),
          ...getRdfaAttrs(node),
        };
      },
    },
    {
      tag: 'h3',
      getAttrs(node: HTMLElement) {
        return {
          level: 3,
          indentationLevel: optionMapOr(
            0,
            parseInt,
            node.dataset.indentationLevel,
          ),
          ...getRdfaAttrs(node),
        };
      },
    },
    {
      tag: 'h4',
      getAttrs(node: HTMLElement) {
        return {
          level: 4,
          indentationLevel: optionMapOr(
            0,
            parseInt,
            node.dataset.indentationLevel,
          ),
          ...getRdfaAttrs(node),
        };
      },
    },
    {
      tag: 'h5',
      getAttrs(node: HTMLElement) {
        return {
          level: 5,
          indentationLevel: optionMapOr(
            0,
            parseInt,
            node.dataset.indentationLevel,
          ),
          ...getRdfaAttrs(node),
        };
      },
    },
    {
      tag: 'h6',
      getAttrs(node: HTMLElement) {
        return {
          level: 6,
          indentationLevel: optionMapOr(
            0,
            parseInt,
            node.dataset.indentationLevel,
          ),
          ...getRdfaAttrs(node),
        };
      },
    },
  ],
  toDOM(node: PNode) {
    const { level, indentationLevel, ...attrs } = node.attrs;
    return [
      `h${(level as number).toString()}`,
      {
        'data-indentation-level': indentationLevel as number,
        class: 'say-editable',
        ...attrs,
      },
      0,
    ];
  },
};
