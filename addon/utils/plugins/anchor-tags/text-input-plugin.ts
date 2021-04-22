import { TextInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/text-input-handler';
import { Editor,
         Manipulation,
  ManipulationGuidance,
  InsertTextIntoTextNodeManipulation
       } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';

function enterTextAfterAnchor(manipulation: InsertTextIntoTextNodeManipulation, editor: Editor) {
  const anchorTag = manipulation.node.parentElement;
  const text = manipulation.text;
  if (anchorTag) {
    const newNode = document.createTextNode(text);
    anchorTag.after(newNode);
    editor.updateRichNode();
    editor.setCaret(newNode, newNode.length);
  }
}

function enterTextBeforeAnchor(manipulation: InsertTextIntoTextNodeManipulation, editor: Editor) {
  const anchorTag = manipulation.node.parentElement;
  const text = manipulation.text;
  if (anchorTag) {
    const newNode = document.createTextNode(text);
    anchorTag.before(newNode);
    editor.updateRichNode();
    editor.setCaret(newNode, newNode.length);
  }
}
export default class AnchorTagTextInputPlugin implements TextInputPlugin {
  label = 'text input plugin for handling text input in anchors';

  guidanceForManipulation(manipulation: Manipulation) : ManipulationGuidance | null {
    if (manipulation.type == "insertTextIntoTextNode") {
      const { node: textNode, position } = manipulation;
      const parentElement = textNode.parentElement;
      if (parentElement && parentElement.tagName.toLowerCase() == 'a')
        if (parentElement.lastChild == textNode && position == textNode.length) {
          return {
            allow: true,
            executor: enterTextAfterAnchor
          };
        }
      else if (parentElement.firstChild == textNode && position == 0) {
        return {
          allow: true,
          executor: enterTextBeforeAnchor
        };
      }
    }
    return null;
  }
}
