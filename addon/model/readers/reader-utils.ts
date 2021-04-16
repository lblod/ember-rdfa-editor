import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export function copyAttributes(from: Element, to: ModelNode) {
    for (const attr of from.attributes) {
      to.setAttribute(attr.name, attr.value);
    }
}

export function addChildOrFragment(parent: ModelElement, child: ModelNode) {
  if(ModelNode.isFragment(child)) {
    parent.appendChildren(...child.children);
  } else {
    parent.addChild(child);
  }
}
