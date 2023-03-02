import {
  Decoration,
  DecorationSet,
  EditorState,
  ProsePlugin,
  SayView,
  TextSelection,
} from '@lblod/ember-rdfa-editor';
import { gecko } from '@lblod/ember-rdfa-editor/utils/_private/browser';
import { isNone } from '@lblod/ember-rdfa-editor/utils/_private/option';

export function firefoxCursorFix(): ProsePlugin {
  const firefoxCursorFix = new ProsePlugin({
    props: {
      handleDOMEvents: {
        mousedown(view: SayView, event: MouseEvent) {
          if (!gecko) {
            return;
          }
          const clickedPos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          console.log('clickpos', clickedPos);
          if (isNone(clickedPos)) {
            return;
          }
          const $pos = view.state.doc.resolve(clickedPos.pos);
          let cur = $pos.nodeAfter;
          let insertPos = $pos.pos;
          while (cur && !cur.type.spec.needsFFKludge) {
            cur = cur.firstChild;
            insertPos++;
          }
          if (cur?.type.spec.needsFFKludge) {
            event.preventDefault();
            view.dispatch(
              view.state.tr
                .setSelection(
                  new TextSelection(view.state.doc.resolve(insertPos))
                )
                .scrollIntoView()
            );
            return true;
          }
          return;
        },
      },
      decorations(state: EditorState): DecorationSet | undefined {
        if (!gecko) {
          return;
        }
        const { $from, from, to } = state.selection;
        if (from !== to) {
          return;
        }
        const nextNode = $from.nodeAfter;
        const prevNode = $from.nodeBefore;
        if (
          (nextNode?.type.spec.needsFFKludge && !prevNode) ||
          prevNode?.type.spec.needsFFKludge
        ) {
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              from,
              () => {
                const wrapper = document.createElement('span');
                wrapper.classList.add(
                  'ProseMirror-firefox-fake-cursor-wrapper'
                );
                const cursor = new Text('|');
                const fakeCursor = document.createElement('span');
                fakeCursor.append(cursor);
                fakeCursor.classList.add('ProseMirror-firefox-fake-cursor');
                wrapper.append(fakeCursor);
                return wrapper;
              },
              { side: 1 }
            ),
          ]);
        }
        return;
      },
    },
  });
  return firefoxCursorFix;
}
