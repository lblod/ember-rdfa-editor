import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import {isTextNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export type TextAttribute = "bold" | "italic" | "underline" | "strikethrough";

/**
 * Represents a textNode in the model. Can not have children.
 * The attributes are valid for the entire node. When attributes need to be applied to a partial
 * range the node has to be split
 */
export default class RichText {
  private readonly attributeMap: Map<TextAttribute, boolean>;
  private _content: string;
  private _parent: RichTextContainer | null = null;
  nextSibling: RichText | null = null;
  previousSibling: RichText | null = null;
  boundNode: Text | null = null;

  constructor(content: string = "") {
    this._content = content;
    this.attributeMap = new Map<TextAttribute, boolean>();
  }

  /**
   * The text content of the node
   */
  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  /**
   * The parent container node.
   */
  get parent(): RichTextContainer | null {
    return this._parent;
  }

  set parent(value: RichTextContainer | null) {
    this._parent = value;
  }

  /**
   * A map of attributes and their value
   */
  get attributes(): Map<TextAttribute, boolean> {
    return this.attributeMap;
  }

  /**
   * Get the next RichText node, regardless of hierarchy.
   */
  get next(): RichText | null {
    if(this.nextSibling) {
      return this.nextSibling;
    } else {
      return this.parent?.next?.firstChild || null;
    }
  }
  /**
   * Get the previous RichText node, regardless of hierarchy.
   */
  get previous(): RichText | null {
    if(this.previousSibling) {
      return this.previousSibling;
    } else {
      return this.parent?.previous?.lastChild || null;
    }
  }

  setAttribute(name: TextAttribute, value: boolean) {
    this.attributeMap.set(name, value);
  }
  getAttribute(name: TextAttribute): boolean {
    return this.attributeMap.get(name) || false;
  }

  /**
   * Find the dom TextNode that corresponds to this node.
   */
  getCorrespondingDomNode(): Node | null {
    const index = this.parent?.children.indexOf(this)!;
    let node: ChildNode | null= this.parent!.boundNode!.childNodes[index];
    while(node && !isTextNode(node)) {
      node = node.firstChild;
    }
    return node;
  }

  /**
   * Split the node at an index and return both parts. The left node
   * will be the original node with its content truncated, the right node is
   * the new node
   * @param at
   */
  split(at: number): {left: RichText, right: RichText} {
    const leftContent = this.content.substring(0, at);
    const rightContent = this.content.substring(at);
    this.content = leftContent;
    const right = new RichText(rightContent);
    this.parent?.addChild(right, this.parent?.children.indexOf(this) + 1);
    return {left: this, right};
  }

}
