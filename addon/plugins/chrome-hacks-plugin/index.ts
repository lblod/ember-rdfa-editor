import {
  Decoration,
  DecorationSet,
  EditorState,
  ProsePlugin,
} from '@lblod/ember-rdfa-editor';
import { chrome } from '@lblod/ember-rdfa-editor/utils/_private/browser';

export function chromeHacksPlugin(): ProsePlugin {
  const chromeHacksPlugin = new ProsePlugin({
    props: {
      handleKeyDown(view, event: KeyboardEvent): boolean {
        if (!chrome) {
          return false;
        }
        if (event.key === 'Delete') {
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
          if (nodeAfter && nodeAfter.type.spec['needsChromeCursorFix']) {
            view.dispatch(view.state.tr.deleteRange(from, $posToCheck.pos));
            return true;
          }
        }
        return false;
      },
      decorations(state: EditorState): DecorationSet | undefined {
        if (!chrome) {
          return;
        }
        const { $from, from, to } = state.selection;
        if (from !== to) {
          return;
        }
        const nextNode = $from.nodeAfter;
        if (nextNode?.type.spec['needsChromeCursorFix']) {
          return DecorationSet.create(state.doc, [
            Decoration.widget(
              from,
              () => {
                const fakeCursor = document.createElement('span');
                return fakeCursor;
              },
              { side: 1 },
            ),
          ]);
        }
        return;
      },
    },
  });
  return chromeHacksPlugin;
}
