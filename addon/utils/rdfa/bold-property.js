import EditorProperty from '../ce/editor-property';
import { isList, isPhrasingContent } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { A } from '@ember/array';
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
  permittedContent(richNode) {
    const nodes = A();
    const isTextNodeUnderList = (richNode.type === "text" && richNode.parent && isList(richNode.parent.domNode));
    if (isPhrasingContent(richNode.domNode)) {
      if (!isTextNodeUnderList)
        nodes.pushObject(richNode);
    }
    else {
      if (richNode.children) {
        for(let child of richNode.children) {
          nodes.pushObjects(this.permittedContent(child));
        }
      }
    }
    return nodes;
  }
}
const boldProperty = new BoldProperty({});
export default boldProperty;
