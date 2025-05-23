import { EditorView } from 'prosemirror-view';
import { TextSelection } from 'prosemirror-state';
import { ProsePlugin } from '#root/prosemirror-aliases.ts';
import SayView from '#root/core/say-view.ts';
import { gecko } from '#root/utils/_private/browser.ts';

export function firefoxCursorFix(): ProsePlugin {
  const firefoxCursorFix = new ProsePlugin({
    props: {
      handleKeyDown(view, event: KeyboardEvent): boolean {
        if (!gecko) {
          return false;
        }
        if (event.key === 'Backspace') {
          const { $from, from, to } = view.state.selection;
          if (from !== to) {
            return false;
          }
          // If we're at the start of the parent node, the problem cannot occur
          // since it only happens when we backspace into a problematic previous sibling
          if ($from.parentOffset === 0) {
            return false;
          }
          // The problematic position is reached AFTER we backspace the char right after the problematic node
          // so we have to check one position in advance
          const $posToCheck = view.state.doc.resolve($from.pos - 1);
          const nodeBefore = $posToCheck.nodeBefore;
          if (nodeBefore && nodeBefore.type.spec['needsFFKludge']) {
            const tr = view.state.tr;
            tr.deleteRange($posToCheck.pos, from);
            view.dispatch(tr);
            return true;
          }
        } else if (event.key === 'Delete') {
          const { $from, from, to } = view.state.selection;
          if (from !== to) {
            return false;
          }
          // The problem with deleting only occurs if we're at the start of the parent node
          if ($from.parentOffset !== 0) {
            return false;
          }
          const $posToCheck = view.state.doc.resolve($from.pos + 1);
          const nodeAfter = $posToCheck.nodeAfter;
          if (nodeAfter && nodeAfter.type.spec['needsFFKludge']) {
            view.dispatch(view.state.tr.deleteRange(from, $posToCheck.pos));
            return true;
          }
        }
        return false;
      },
      handleClick(view: EditorView | SayView, pos: number, event: MouseEvent) {
        const $pos = view.state.doc.resolve(pos);
        let cur = $pos.nodeAfter;
        let insertPos = $pos.pos;
        while (cur && !cur.type.spec['needsFFKludge']) {
          cur = cur.firstChild;
          insertPos++;
        }
        if (cur?.type.spec['needsFFKludge']) {
          event.preventDefault();
          view.dispatch(
            view.state.tr
              .setSelection(
                new TextSelection(view.state.doc.resolve(insertPos)),
              )
              .scrollIntoView(),
          );
          return true;
        }
        return;
      },
    },
  });
  return firefoxCursorFix;
}
