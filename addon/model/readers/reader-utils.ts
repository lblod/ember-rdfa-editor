import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";

export function copyAttributes(from: Element, to: ModelNode) {
    for (const attr of from.attributes) {
      to.setAttribute(attr.name, attr.value);
    }
}

export function pushOrExpand(parent: ModelNode[], child: ModelNode | ModelNode[]) {
  if(child instanceof Array) {
    parent.push(...child);
  } else {
    parent.push(child);
  }
}
