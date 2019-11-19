import EditorProperty from '../ce/editor-property';

/**
 * Editor property that represents bold text.
 * @module rdfa-editor
 * @class BoldProperty
 * @constructor
 * @extends EditorProperty
 * @public
 */
class BoldProperty extends EditorProperty {
  constructor({tagName = 'strong', newContext = true}) {
    super({tagName, newContext});
  }
  /**
   * is bold property enabled on the provided richnode?
   * @method enabledAt
   * @param {RichNode} richNode
   *
   * @public
   */
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
