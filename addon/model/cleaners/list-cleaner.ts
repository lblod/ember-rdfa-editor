import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export default class ListCleaner {
  clean(root: ModelNode) {
    if (!ModelNode.isModelElement(root)) {
      return;
    }


    let cur: ModelNode | null = root.firstChild;

    while (cur) {
      this.clean(cur);
      let next: ModelNode | null = cur.nextSibling;
      if (ListCleaner.isList(cur)) {
        while (next && ListCleaner.isList(next)) {
          ListCleaner.mergeListNodes(cur, next);
          next = next.nextSibling;
        }
      }
      cur = next;
    }

  }

  private static mergeListNodes(node1: ModelElement, node2: ModelElement) {
    node1.appendChildren(...node2.children);
    node2.parent?.removeChild(node2);
  }

  private static isList(node?: ModelNode | null): node is ModelElement {
    return !!node && ModelNode.isModelElement(node) && (node.type === "ul" || node.type === "ol");
  }
}
