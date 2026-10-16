import type { Node as PNode } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { ProsePlugin } from '#root/prosemirror-aliases.ts';

type Direction = 'backward' | 'forward';

function extendSelectionOverInlineNode(
  view: EditorView,
  node: PNode,
  direction: Direction,
): boolean {
  const { doc, selection } = view.state;
  const offset = direction === 'forward' ? node.nodeSize : -node.nodeSize;
  view.dispatch(
    view.state.tr
      .setSelection(
        TextSelection.create(doc, selection.anchor, selection.head + offset),
      )
      .scrollIntoView(),
  );
  return true;
}

export function shiftArrowSelectionHandler(): ProsePlugin {
  return new ProsePlugin({
    props: {
      handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
        if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
          return false;
        }
        const { selection } = view.state;
        // We decided to only handle text selections in the future, we could have a look at node selections too
        if (!(selection instanceof TextSelection)) {
          return false;
        }
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowLeft':
          case 'ArrowDown':
          case 'ArrowUp': {
            const direction =
              event.key === 'ArrowRight' || event.key === 'ArrowDown'
                ? 'forward'
                : 'backward';
            const nextNode =
              direction === 'forward'
                ? selection.$head.nodeAfter
                : selection.$head.nodeBefore;
            // If the nodeAfter or nodeBefore the selection is an atom we just extend the selection over it
            if (nextNode && !nextNode.isText && nextNode.isAtom) {
              return extendSelectionOverInlineNode(view, nextNode, direction);
            }
            return false;
          }
          default:
            return false;
        }
      },
    },
  });
}
