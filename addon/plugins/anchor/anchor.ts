import { eventTargetRange } from '@lblod/ember-rdfa-editor/input/utils';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';

export class AnchorPlugin implements EditorPlugin {
  controller!: Controller;

  get name() {
    return 'anchor';
  }
  initialize(_controller: Controller, _options: unknown): Promise<void> {
    this.controller = _controller;
    return Promise.resolve();
  }

  handleEvent(event: InputEvent) {
    if (event.inputType === 'insert-text' && event.data) {
      const range = eventTargetRange(
        this.controller.currentState,
        this.controller.view.domRoot,
        event
      );
      const text = event.data;
      const collapsed = range.collapsed;
      const {
        start,
        end,
        start: { parent: startParent },
        end: { parent: endParent },
      } = range;

      let anyAnchors = false;
      if (startParent.type === 'a' && start.parentOffset === 0) {
        anyAnchors = true;
        range.start = ModelPosition.fromBeforeNode(startParent);
        if (collapsed) {
          range.collapse(true);
        }
      }

      if (
        endParent.type === 'a' &&
        end.parentOffset === endParent.getMaxOffset()
      ) {
        anyAnchors = true;
        range.end = ModelPosition.fromAfterNode(endParent);
        if (collapsed) {
          range.collapse();
        }
      }

      if (anyAnchors) {
        this.controller.perform((tr) => {
          tr.commands.insertText({ text, range });
        });
        return { handled: true };
      }
    }
    return { handled: false };
  }
}
// TODO
//
// export default class AnchorTagTextInputPlugin implements TextInputPlugin {
//   label = 'Text input plugin for handling text input in anchors';

//   guidanceForManipulation(
//     manipulation: TextHandlerManipulation
//   ): ManipulationGuidance | null {
//     const { range, text } = manipulation;
//     if (manipulation.type === 'insertTextIntoRange') {
//       const clonedRange = range.clone();
//       const collapsed = clonedRange.collapsed;
//       const {
//         start,
//         end,
//         start: { parent: startParent },
//         end: { parent: endParent },
//       } = clonedRange;

//       let anyAnchors = false;
//       if (startParent.type === 'a' && start.parentOffset === 0) {
//         anyAnchors = true;
//         clonedRange.start = ModelPosition.fromBeforeNode(startParent);
//         if (collapsed) {
//           clonedRange.collapse(true);
//         }
//       }

//       if (
//         endParent.type === 'a' &&
//         end.parentOffset === endParent.getMaxOffset()
//       ) {
//         anyAnchors = true;
//         clonedRange.end = ModelPosition.fromAfterNode(endParent);
//         if (collapsed) {
//           clonedRange.collapse();
//         }
//       }

//       if (anyAnchors) {
//         return {
//           allow: true,
//           executor: (_, rawEditor: RawEditor) => {
//             rawEditor.executeCommand('insert-text', text, clonedRange);
//           },
//         };
//       }
//     }

//     return null;
//   }
// }
