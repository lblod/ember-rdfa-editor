import EditorProperty from '@lblod/ember-contenteditable-editor/utils/editor-property';

/**
 * Editor property that represents italic text.
 * @module rdfa-editor
 * @class ItalicProperty
 * @constructor
 * @extends EditorProperty
 * @public
 */
class ItalicProperty extends EditorProperty {
  constructor({tagName = 'em', newContext = true}) {
    super({tagName, newContext});
  }
  /**
   * is italic property enabled on the provided richnode?
   * @method enabledAt
   * @param {RichNode}
   * @public
   */
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
