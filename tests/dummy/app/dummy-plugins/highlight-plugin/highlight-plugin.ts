import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';
import RdfaEditorPlugin from '@lblod/ember-rdfa-editor/core/rdfa-editor-plugin';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
export interface HighlightPluginOptions {
  testKey: string;
}

function placeholder(): Plugin {
  const placeholder: Plugin<DecorationSet> = new Plugin<DecorationSet>({
    state: {
      init(_, state: EditorState) {
        const { doc } = state;
        const ranges: { start: number; end: number }[] = [];
        doc.descendants((node, pos) => {
          if (node.isText && node.text) {
            const regexp = /test/g;
            let match: RegExpExecArray | null;
            while ((match = regexp.exec(node.text)) !== null) {
              ranges.push({
                start: pos + match.index,
                end: pos + match.index + 4,
              });
            }
          }
        });

        const decorations = ranges.map(({ start, end }) =>
          Decoration.inline(start, end, { style: 'background: yellow' })
        );
        return DecorationSet.create(doc, decorations);
      },
      apply(
        tr: Transaction,
        set: DecorationSet,
        oldState: EditorState,
        newState: EditorState
      ) {
        const { doc } = newState;
        const ranges: { start: number; end: number }[] = [];
        doc.descendants((node, pos) => {
          if (node.isText && node.text) {
            for (const match of node.text.matchAll(/test/g)) {
              ranges.push({
                start: pos + match.index!,
                end: pos + match.index! + 4,
              });
            }
          }
        });

        const decorations = ranges.map(({ start, end }) =>
          Decoration.inline(start, end, { style: 'background: yellow' })
        );
        return DecorationSet.create(doc, decorations);
      },
    },
    props: {
      decorations(state: EditorState) {
        return placeholder.getState(state);
      },
    },
  });
  // props: {
  //   decorations: (state) => {
  //     const decorations: Decoration[] = [];
  //
  //     const decorate = (node: PNode, pos: number) => {
  //       if (
  //         node.type.isBlock &&
  //         node.childCount === 0 &&
  //         state.selection.$anchor.parent !== node
  //       ) {
  //         decorations.push(
  //           Decoration.node(pos, pos + node.nodeSize, {
  //             class: 'empty-node',
  //           })
  //         );
  //       }
  //     };
  //
  //     state.doc.descendants(decorate);
  //
  //     return DecorationSet.create(state.doc, decorations);
  //   },
  // },
  return placeholder;
}

export default class HighlightPlugin extends RdfaEditorPlugin {
  private logger: Logger = createLogger(this.constructor.name);

  initialize(options?: HighlightPluginOptions): void {
    this.logger('received options: ', options);
  }

  proseMirrorPlugins(): Plugin[] {
    return [placeholder()];
  }
}
