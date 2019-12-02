import EditorProperty from '../ce/editor-property';
import { isList, isPhrasingContent } from '../ce/dom-helpers';
import { A } from '@ember/array';

/**
 * Editor property that represents underlined text.
 * @module rdfa-editor
 * @class StrikethroughProperty
 * @constructor
 * @extends EditorProperty
 * @public
 */
class StrikethroughProperty extends EditorProperty {
  constructor({tagName = 's', newContext = true}) {
    super({tagName, newContext});
  }
  enabledAt(richNode) {
    if (!richNode)
      return false;
    if (richNode.type === 'text') {
      return window.getComputedStyle(richNode.parent.domNode).textDecoration.includes("line-through");
    }
    else if (richNode.type === 'tag') {
      return window.getComputedStyle(richNode.domNode).textDecoration.includes("line-through");
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

const strikethroughProperty = new StrikethroughProperty({});
export default strikethroughProperty;
