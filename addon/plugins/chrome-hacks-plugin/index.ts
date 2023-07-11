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
      decorations(state: EditorState): DecorationSet | undefined {
        if (!chrome) {
          return;
        }
        const { $from, from, to } = state.selection;
        if (from !== to) {
          return;
        }
        const nextNode = $from.nodeAfter;
        if (nextNode?.type.spec.needsChromeCursorFix) {
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
