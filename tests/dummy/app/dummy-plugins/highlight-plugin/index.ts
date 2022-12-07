import {
  Decoration,
  DecorationSet,
  EditorState,
  PNode,
  ProsePlugin,
  Transaction,
} from '@lblod/ember-rdfa-editor';

function calculateDecorations(doc: PNode, testKey: string) {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      for (const match of node.text.matchAll(new RegExp(`${testKey}`, 'g'))) {
        decorations.push(
          Decoration.inline(pos + match.index!, pos + match.index! + 4, {
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

export function highlight(options: HighlightOptions): ProsePlugin {
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
