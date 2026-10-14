import type { Node as PNode, ResolvedPos } from 'prosemirror-model';
import { NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { ProsePlugin } from '#root/prosemirror-aliases.ts';

type Direction = 'backward' | 'forward';

type AdjacentBlock = {
  node: PNode;
  pos: number;
};


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
            if (inlineAtom && !inlineAtom.isText && inlineAtom.isAtom) {
              return extendSelectionOverInlineAtom(view, inlineAtom, direction);
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              const block = adjacentBlock(selection.$head, direction);
              if (block && block.node.isAtom) {
                return extendSelectionOverAtom(view, block, direction);
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
