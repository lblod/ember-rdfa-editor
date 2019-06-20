import EditorProperty from '@lblod/ember-contenteditable-editor/utils/editor-property';

class BoldProperty extends EditorProperty {
  constructor({tagName = 'strong', newContext = true}) {
    super({tagName, newContext});
  }
  enabledAt(richNode) {
    if (!richNode)
      return false;
    if (richNode.type === 'text') {
      return window.getComputedStyle(richNode.parent.domNode).fontWeight > 400;
    }
    else if (richNode.type === 'tag') {
      return window.getComputedStyle(richNode.domNode).fontWeight > 400;
    }
    else
      return false;
  }
}
const boldProperty = new BoldProperty({});
export default boldProperty;
