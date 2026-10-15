import type { Node as PNode, ResolvedPos } from 'prosemirror-model';
import { NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { ProsePlugin } from '#root/prosemirror-aliases.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';

type Direction = 'backward' | 'forward';

function findAdjacentBlock(
  head: ResolvedPos,
  direction: Direction,
): ResolvedPNode | null {
  for (let depth = head.depth; depth > 0; depth--) {
    const parent = head.node(depth - 1);
    const index = head.index(depth - 1);
    const siblingIndex = direction === 'forward' ? index + 1 : index - 1;
    if (siblingIndex < 0 || siblingIndex >= parent.childCount) {
      continue;
    }
    const node = parent.child(siblingIndex);
    const pos =
      direction === 'forward'
        ? head.after(depth)
        : head.before(depth) - node.nodeSize;
    return { value: node, pos };
  }
  return null;
}

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

function extendSelectionOverBlockNode(
  view: EditorView,
  node: ResolvedPNode,
  direction: Direction,
): boolean {
  const { doc, selection } = view.state;
  const boundary =
    direction === 'forward' ? node.pos + node.value.nodeSize : node.pos;
  const target = Selection.findFrom(
    doc.resolve(boundary),
    direction === 'forward' ? 1 : -1,
    true,
  );

  if (target) {
    view.dispatch(
      view.state.tr
        .setSelection(TextSelection.create(doc, selection.anchor, target.head))
        .scrollIntoView(),
    );
    return true;
  }

  // This is needed for when the block node is the last or first position of a document and we want to select it
  if (selection.empty && NodeSelection.isSelectable(node.value)) {
    view.dispatch(
      view.state.tr
        .setSelection(NodeSelection.create(doc, node.pos))
        .scrollIntoView(),
    );
    return true;
  }

  return false;
}

export function keyboardSelectionHandler(): ProsePlugin {
  return new ProsePlugin({
    props: {
      handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
        if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
          return false;
        }
        const { selection } = view.state;
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
            const inlineAtom =
              direction === 'forward'
                ? selection.$head.nodeAfter
                : selection.$head.nodeBefore;
            // If the selection is an inline atom we just extend the selection over it
            if (inlineAtom && !inlineAtom.isText && inlineAtom.isAtom) {
              return extendSelectionOverInlineNode(view, inlineAtom, direction);
              // But if not and the user has pressed up or down we try to find the next block to extend the
              // selection over, with the right/left arrows the behaviour stops at the end of the line
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              const block = findAdjacentBlock(selection.$head, direction);
              if (block && block.value.isAtom) {
                return extendSelectionOverBlockNode(view, block, direction);
              }
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
