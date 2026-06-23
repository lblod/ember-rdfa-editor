import type { PNode } from '#root/prosemirror-aliases.js';
import { EditorState, Plugin, PluginKey, Selection } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';

export const emptyBlockPlaceholderKey = new PluginKey('SLASH_COMMANDS_PLUGIN');

function isSelectionInsideNode(selection: Selection, node: PNode, pos: number) {
  const { from, to } = selection;
  return from > pos && to < pos + node.nodeSize;
}

function isNodeEmpty(node: PNode): boolean {
  if (node.isText) {
    return node.textContent.trim().length === 0;
  }

  return (
    node.content.size === 0 ||
    node.children.every((node) => node.content.size === 0)
  );
}

export function emptyBlockPlaceholder() {
  return new Plugin({
    key: emptyBlockPlaceholderKey,
    props: {
      decorations(state: EditorState) {
        const { doc, selection } = state;
        const emptyRdfaBlocks: {
          node: PNode;
          pos: number;
          placeholder?: string;
        }[] = [];

        state.doc.descendants((node, pos) => {
          if (
            node.type.name === 'block_rdfa' &&
            isNodeEmpty(node) &&
            node.attrs['placeholder'] &&
            !isSelectionInsideNode(selection, node, pos)
          ) {
            const placeholder =
              'placeholder' in node.attrs &&
              typeof node.attrs['placeholder'] === 'string'
                ? node.attrs['placeholder']
                : undefined;
            emptyRdfaBlocks.push({
              node,
              pos,
              placeholder,
            });
            return false;
          }
          return true;
        });
        const decorations = emptyRdfaBlocks.map(({ pos, placeholder }) =>
          Decoration.widget(pos + 2, () => {
            const el = document.createElement('span');
            el.classList.add('mark-highlight-manual');
            el.classList.add('say-placeholder');
            // Unnecessary check but otherwise TS complains
            if (placeholder) {
              el.textContent = placeholder;
            }
            el.style.pointerEvents = 'none';
            return el;
          }),
        );
        return DecorationSet.create(doc, decorations);
      },
    },
  });
}
