import {
  Decoration,
  DecorationSet,
  EditorState,
  PNode,
  ProsePlugin,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';

function calculateDecorations(doc: PNode, testKey: string) {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      for (const match of node.text.matchAll(new RegExp(`${testKey}`, 'g'))) {
        const index = unwrap(match.index);
        decorations.push(
          Decoration.inline(pos + index, pos + index + 4, {
            style: 'background: yellow',
          })
        );
      }
    }
  });
  return DecorationSet.create(doc, decorations);
}

export interface HighlightOptions {
  testKey: string;
}

export function highlightPlugin(options: HighlightOptions): ProsePlugin {
  const highlight: ProsePlugin<DecorationSet> = new ProsePlugin<DecorationSet>({
    state: {
      init(_, state: EditorState) {
        const { doc } = state;
        return calculateDecorations(doc, options.testKey);
      },
      apply(
        tr: Transaction,
        set: DecorationSet,
        oldState: EditorState,
        newState: EditorState
      ) {
        const { doc } = newState;
        return calculateDecorations(doc, options.testKey);
      },
    },
    props: {
      decorations(state: EditorState) {
        return highlight.getState(state);
      },
    },
  });
  return highlight;
}
