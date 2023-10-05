import { PNode } from '@lblod/ember-rdfa-editor';
import SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';

type Attrs = {
  description?: string;
  comment?: string;
};
export const editable_block: SayNodeSpec = {
  inline: false,
  group: 'block',
  editable: true,
  content: 'block+',
  draggable: false,
  selectable: true,
  isolating: true,
  atom: false,
  defining: true,
  attrs: {
    description: {
      default: null,
      editable: true,
    },
    comment: {
      default: 'default value',
      editable: true,
    },
  },
  parseDOM: [
    {
      tag: `div`,
      getAttrs(node: HTMLElement) {
        return {
          description: node.dataset.description,
        };
      },
    },
  ],
  toDOM(node: PNode) {
    const { description, comment } = node.attrs as Attrs;
    const domAttrs = {
      ...(description && {
        'data-description': description,
      }),
      ...(comment && {
        'data-comment': description,
      }),
      class: 'say-editable',
    };

    return ['div', domAttrs, 0];
  },
};
