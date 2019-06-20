import EditorProperty from '@lblod/ember-contenteditable-editor/utils/editor-property';

class UnderlineProperty extends EditorProperty {
  constructor({tagName = 'u', newContext = true}) {
    super({tagName, newContext});
  }
  enabledAt(richNode) {
    if (!richNode)
      return false;
    if (richNode.type === 'text') {
      return window.getComputedStyle(richNode.parent.domNode).textDecoration.includes("underline");
    }
    else if (richNode.type === 'tag') {
      return window.getComputedStyle(richNode.domNode).textDecoration.includes("underline");
    }
    else
      return false;
  }
}
const underlineProperty = new UnderlineProperty({});
export default underlineProperty;
