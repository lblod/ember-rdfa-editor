import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';

export function copyAttributes(from: Element, to: ModelNode) {
  for (const attr of from.attributes) {
    to.setAttribute(attr.name, attr.value);
  }
}
