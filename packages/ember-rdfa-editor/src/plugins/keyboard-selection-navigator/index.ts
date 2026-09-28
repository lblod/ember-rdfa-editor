import type { Node as PNode, ResolvedPos } from 'prosemirror-model';
import { NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { ProsePlugin } from '#root/prosemirror-aliases.ts';

type Direction = 'backward' | 'forward';

type AdjacentBlock = {
  node: PNode;
  pos: number;
};

/**
 * Returns the block node directly before/after the innermost block
 * containing `$head`, climbing up out of parents which have no
 * sibling in the given direction. Returns `null` when no such block
 * exists.
 */
function adjacentBlock(
  $head: ResolvedPos,
  direction: Direction,
): AdjacentBlock | null {
  for (let depth = $head.depth; depth > 0; depth--) {
    const parent = $head.node(depth - 1);
    const index = $head.index(depth - 1);
    const siblingIndex = direction === 'forward' ? index + 1 : index - 1;
    if (siblingIndex < 0 || siblingIndex >= parent.childCount) {
      continue;
    }
    const node = parent.child(siblingIndex);
    const pos =
      direction === 'forward'
        ? $head.after(depth)
        : $head.before(depth) - node.nodeSize;
    return { node, pos };
  }
  return null;
}

/**
 * Extends the selection over an inline atom (e.g. a link node)
 * directly next to the selection head.
 *
 * The head jumps over the whole atom, so the atom is selected as a
 * single unit, alongside the content that was already selected.
 */
function extendSelectionOverInlineAtom(
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

/**
 * Extends the selection so it covers the whole block atom next to
 * the current selection head, alongside the content that was
 * already selected.
 *
 * The head moves to the first valid caret position beyond the atom,
 * which makes the atom part of the selection range. When no such
 * position exists (e.g. the atom is the first/last node of the
 * document) and nothing was selected yet, the atom itself is selected
 * as a node selection instead.
 */
function extendSelectionOverAtom(
  view: EditorView,
  atom: AdjacentBlock,
  direction: Direction,
): boolean {
  const { doc, selection } = view.state;
  const boundary =
    direction === 'forward' ? atom.pos + atom.node.nodeSize : atom.pos;
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

  if (selection.empty && NodeSelection.isSelectable(atom.node)) {
    view.dispatch(
      view.state.tr
        .setSelection(NodeSelection.create(doc, atom.pos))
        .scrollIntoView(),
    );
    return true;
  }

  return false;
}

/**
 * Plugin which makes extending a selection with **Shift-Arrow** keys
 * work when the next thing to select is an atom.
 *
 * - **Shift-ArrowRight** / **Shift-ArrowLeft**: when the inline node
 *   directly before/after the selection head is an atom (e.g. a link
 *   node), the whole atom is selected as a single unit and the head
 *   jumps to the content after/before it.
 * - **Shift-ArrowUp** / **Shift-ArrowDown**: when the block next to
 *   the selection head is an atom, the whole atom is selected
 *   alongside whatever was already selected, instead of the caret
 *   snapping into (or refusing to enter) the atom.
 */
export function keyboardSelectionNavigator(): ProsePlugin {
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
          case 'ArrowLeft': {
            const direction =
              event.key === 'ArrowRight' ? 'forward' : 'backward';
            const node =
              direction === 'forward'
                ? selection.$head.nodeAfter
                : selection.$head.nodeBefore;
            // text nodes are atoms too (they are leaves), but the
            // caret can travel through them natively
            if (!node || node.isText || !node.isAtom) {
              return false;
            }
            return extendSelectionOverInlineAtom(view, node, direction);
          }
          case 'ArrowDown':
          case 'ArrowUp': {
            const direction =
              event.key === 'ArrowDown' ? 'forward' : 'backward';
            const adjacent = adjacentBlock(selection.$head, direction);
            if (!adjacent || !adjacent.node.isAtom) {
              return false;
            }
            return extendSelectionOverAtom(view, adjacent, direction);
          }
          default:
            return false;
        }
      },
    },
  });
}
