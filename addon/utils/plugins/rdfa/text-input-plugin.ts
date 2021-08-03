import {
  TextHandlerManipulation,
  TextInputPlugin
} from '@lblod/ember-rdfa-editor/editor/input-handlers/text-input-handler';
import {ManipulationGuidance,} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {stringToVisibleText} from '@lblod/ember-rdfa-editor/editor/utils';
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";

function updateDataFlaggedRemove(manipulation: TextHandlerManipulation, editor: PernetRawEditor) {
  const {range} = manipulation;
  const parent = range.start.parent;
  const textNodeWalker = new ModelTreeWalker<ModelText>({
    range: ModelRange.fromInElement(parent, 0, parent.getMaxOffset()),
    descend: false,
    filter: toFilterSkipFalse(ModelNode.isModelText)
  });

  let innerText = "";
  for (const node of textNodeWalker) {
    innerText += node.content;
  }

  const length = stringToVisibleText(innerText || "").length;

  if (length <= 2) {
    //TODO this should be done with a command
    parent.setAttribute('data-flagged-remove', 'almost-complete');
  } else if (length > 2) {
    //TODO this should be done with a command
    parent.removeAttribute('data-flagged-remove');
  }

  editor.executeCommand("insert-text", manipulation.text, manipulation.range);
}

export default class RdfaTextInputPlugin implements TextInputPlugin {
  label = 'Text input plugin for handling RDFA specific logic';

  guidanceForManipulation(manipulation: TextHandlerManipulation): ManipulationGuidance | null {
    const {type, range} = manipulation;
    if (type === "insertTextIntoRange" && range.start.parent.getAttribute('data-flagged-remove')) {
      return {
        allow: true,
        executor: updateDataFlaggedRemove
      };
    }

    return null;
  }
}
