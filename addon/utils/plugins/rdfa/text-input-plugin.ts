import { TextInputPlugin, insertTextIntoTextNode } from '@lblod/ember-rdfa-editor/editor/input-handlers/text-input-handler';
import { Editor,
         Manipulation,
  ManipulationGuidance,
  InsertTextIntoTextNodeManipulation
       } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { stringToVisibleText } from '@lblod/ember-rdfa-editor/editor/utils';

function updateDataFlaggedRemove(manipulation: InsertTextIntoTextNodeManipulation, editor: Editor) {
  const textNode = manipulation.node;
  const parent = textNode.parentElement;
  if (parent) {
    const length =  stringToVisibleText(parent.innerText || "").length;
    if (length <= 2) {
      parent.setAttribute('data-flagged-remove', 'almost-complete');
    }
    else if (length > 2){
      parent.removeAttribute('data-flagged-remove');
    }
  }
  insertTextIntoTextNode(textNode, manipulation.position, manipulation.text);
  editor.updateRichNode();
  editor.setCaret(textNode, manipulation.position + 1);
}

export default class RdfaTextInputPlugin implements TextInputPlugin {
  label = 'text input plugin for handling RDFA specific logic';

  guidanceForManipulation(manipulation: Manipulation) : ManipulationGuidance | null {
    const { type, node } = manipulation;
    if (type == "insertTextIntoTextNode" && node.parentElement?.getAttribute('data-flagged-remove')) {
      return {
        allow: true,
        executor: updateDataFlaggedRemove
      };
    }
    return null;
  }
}
