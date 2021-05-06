import {
  TextHandlerManipulation,
  TextInputPlugin
} from '@lblod/ember-rdfa-editor/editor/input-handlers/text-input-handler';
import {ManipulationGuidance} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';

const PLACEHOLDER_CLASS = "mark-highlight-manual";
/**
 * @class PlaceholderTextInputPlugin
 * @module plugins/placeholder-text
 */
export default class PlaceholderTextInputPlugin implements TextInputPlugin {
  label = 'text input plugin for handling RDFA specific logic';


  guidanceForManipulation(manipulation: TextHandlerManipulation): ManipulationGuidance | null {
    const {range: originalRange, text} = manipulation;
    const range = originalRange.clone();

    let anyPlaceholder = false;
    if (isPlaceHolder(range.start.parent)) {
      range.start = ModelPosition.fromBeforeNode(range.start.parent);
      anyPlaceholder = true;
    }
    if (isPlaceHolder(range.end.parent)) {
      range.end = ModelPosition.fromAfterNode(range.end.parent);
      anyPlaceholder = true;
    }
    if (anyPlaceholder) {
      return {
        allow: true, executor: (_, rawEditor: PernetRawEditor) => {
          rawEditor.executeCommand("insert-text", text, range);
        }
      };
    } else {
      return null;
    }
  }
}

function isPlaceHolder(element: ModelElement): boolean {
  return !!element.getAttribute("class")?.includes(PLACEHOLDER_CLASS);
}
