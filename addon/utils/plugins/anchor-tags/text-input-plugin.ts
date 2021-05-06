import {
  TextHandlerManipulation,
  TextInputPlugin
} from '@lblod/ember-rdfa-editor/editor/input-handlers/text-input-handler';
import {ManipulationGuidance,} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";

export default class AnchorTagTextInputPlugin implements TextInputPlugin {
  label = 'text input plugin for handling text input in anchors';

  guidanceForManipulation(manipulation: TextHandlerManipulation): ManipulationGuidance | null {
    const {range, text} = manipulation;
    if (manipulation.type === "insertTextIntoRange") {
      const clonedRange = range.clone();
      const collapsed = clonedRange.collapsed;
      const {start, end, start: {parent: startParent}, end: {parent: endParent}} = clonedRange;

      if (startParent.type === "a" && start.parentOffset === 0) {
        clonedRange.start = ModelPosition.fromBeforeNode(startParent);
        if (collapsed) {
          clonedRange.collapse(true);
        }
      }
      if (endParent.type === "a" && end.parentOffset === endParent.getMaxOffset()) {
        clonedRange.end = ModelPosition.fromAfterNode(endParent);
        if (collapsed) {
          clonedRange.collapse();
        }
      }
      return {
        allow: true, executor: (_, rawEditor: PernetRawEditor) => {
          rawEditor.executeCommand("insert-text", text, clonedRange);
        }
      };
    }
    return null;
  }
}

