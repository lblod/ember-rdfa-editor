import EditorProperty from '../ce/editor-property';
import { isList, isPhrasingContent } from '../ce/dom-helpers';
import { A } from '@ember/array';

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
const italicProperty = new ItalicProperty({});
export default italicProperty;
