import EditorProperty from '@lblod/ember-contenteditable-editor/utils/editor-property';

class ItalicProperty extends EditorProperty {
  constructor({tagName = 'em', newContext = true}) {
    super({tagName, newContext});
  }
  enabledAt(richNode) {
    if (!richNode)
      return false;
    if (richNode.type === 'text') {
      return window.getComputedStyle(richNode.parent.domNode).fontStyle == "italic";
    }
    else if (richNode.type === 'tag') {
      return window.getComputedStyle(richNode.domNode).fontStyle == "italic";
    }
    else
      return false;
  }
}
const italicProperty = new ItalicProperty({});
export default italicProperty;
