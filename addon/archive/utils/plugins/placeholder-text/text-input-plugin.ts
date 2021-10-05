import {
  TextHandlerManipulation,
  TextInputPlugin
} from '@lblod/ember-rdfa-editor/editor/input-handlers/text-input-handler';
import {ManipulationGuidance} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/util/model-node-utils"
import ModelRangeUtils from "@lblod/ember-rdfa-editor/util/model-range-utils"

/**
 * @class PlaceholderTextInputPlugin
 * @module plugins/placeholder-text
 */
export default class PlaceholderTextInputPlugin implements TextInputPlugin {
  label = "Text input plugin for handling RDFA specific logic";

  guidanceForManipulation(manipulation: TextHandlerManipulation): ManipulationGuidance | null {
    const {range: originalRange, text} = manipulation;
    let range = originalRange;

    if (ModelNodeUtils.isPlaceHolder(originalRange.start.parent)
      || ModelNodeUtils.isPlaceHolder(originalRange.end.parent)
    ) {
      range = ModelRangeUtils.getExtendedToPlaceholder(originalRange);
      return {
        allow: true, executor: (_, rawEditor: PernetRawEditor) => {
          rawEditor.executeCommand("insert-text", text, range);
        }
      };
    }

    return null;
  }
}
