import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';
import RdfaEditorPlugin from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Node as PNode } from 'prosemirror-model';
export interface HighlightPluginOptions {
  testKey: string;
}

function calculateDecorations(doc: PNode) {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      for (const match of node.text.matchAll(/test/g)) {
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

function highlight(): Plugin {
  const highlight: Plugin<DecorationSet> = new Plugin<DecorationSet>({
    state: {
      init(_, state: EditorState) {
        const { doc } = state;
        return calculateDecorations(doc);
      },
      apply(
        tr: Transaction,
        set: DecorationSet,
        oldState: EditorState,
        newState: EditorState
      ) {
        const { doc } = newState;
        return calculateDecorations(doc);
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

export default class HighlightPlugin extends RdfaEditorPlugin {
  private logger: Logger = createLogger(this.constructor.name);

  initialize(options?: HighlightPluginOptions): void {
    this.logger('received options: ', options);
  }

  proseMirrorPlugins(): Plugin[] {
    return [highlight()];
  }
}
