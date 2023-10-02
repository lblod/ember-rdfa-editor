import { ComponentLike } from '@glint/template';
import { PNode } from '@lblod/ember-rdfa-editor';
import EditableBlockNode from '@lblod/ember-rdfa-editor/components/_private/editable-block-node/node';
import {
  type EmberNodeConfig,
  createEmberNodeSpec,
  createEmberNodeView,
} from '@lblod/ember-rdfa-editor/utils/ember-node';

type Attrs = {
  description?: string;
  comment?: string;
};
const emberNodeConfig: EmberNodeConfig = {
  name: 'block-node',
  component: EditableBlockNode as unknown as ComponentLike,
  inline: false,
  group: 'block',
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
    };

    return ['div', domAttrs, 0];
  },
};

export const editable_block = createEmberNodeSpec(emberNodeConfig);
export const editableBlockNodeView = createEmberNodeView(emberNodeConfig);
