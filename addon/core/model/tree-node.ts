import {AttributeContainer} from "@lblod/ember-rdfa-editor/core/model/attributes";
import {isElement, tagName} from "@lblod/ember-rdfa-editor/util/dom-helpers";

/**
 * Minimal, unified interface for a node of a tree structure.
 * Part of the effort to make core editor code as flexible as possible.
 */
export default interface TreeNode extends AttributeContainer<string, string> {
  get parent(): TreeNode | null;

  get root(): TreeNode;

  get type(): string;

}

/**
 * Utility class to wrap an htmlnode in the treenode interface
 */
export class HtmlTreeNode implements TreeNode {
  private readonly _node: Node;

  constructor(node: Node) {
    this._node = node;
  }

  get attributeMap(): Map<string, string> {
    const map = new Map<string, string>();
    if (isElement(this._node)) {
      for (const entry of this._node.attributes) {
        map.set(entry.name, entry.value);
      }
    }
    return map;
  }

  getAttribute(key: string): string | undefined {
    if (isElement(this._node)) {
      return this._node.getAttribute(key) ?? undefined;
    }
    return undefined;
  }

  get parent(): TreeNode | null {
    if (this._node.parentNode) {
      return new HtmlTreeNode(this._node.parentNode);
    }
    return null;
  }

  removeAttribute(key: string): boolean {
    let removed = false;
    if (isElement(this._node)) {
      if(this._node.hasAttribute(key)) {
        this._node.removeAttribute(key);
        removed = true;
      }
    }
    return removed;
  }

  get root(): TreeNode {
    return new HtmlTreeNode(this._node.getRootNode());
  }

  setAttribute(key: string, value: string): void {
    if (isElement(this._node)) {
      this._node.setAttribute(key, value);
    }
  }

  get type(): string {
    return tagName(this._node);
  }


}
