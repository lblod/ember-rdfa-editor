import WrappingAttribute from "@lblod/ember-rdfa-editor/model/wrapping-attribute";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import {isElement, isTextNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export type TextAttribute = "bold" | "italic" | "underline" | "strikethrough";

export default class RichText {
  private attributeMap: Map<TextAttribute, boolean>;
  private _content: string;
  private _parent: RichTextContainer | null = null;
  nextSibling: RichText | null = null;
  previousSibling: RichText | null = null;

  constructor(content: string = "") {
    this._content = content;
    this.attributeMap = new Map<TextAttribute, boolean>();
  }

  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  get parent(): RichTextContainer | null {
    return this._parent;
  }

  set parent(value: RichTextContainer | null) {
    this._parent = value;
  }

  get attributes(): Map<TextAttribute, boolean> {
    return this.attributeMap;
  }

  get next(): RichText | null {
    if(this.nextSibling) {
      return this.nextSibling;
    } else {
      return this.parent?.next?.firstChild || null;
    }
  }
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


  getCorrespondingDomNode(): Node | null {
    const index = this.parent?.children.indexOf(this)!;
    let node: ChildNode | null= this.parent!.boundNode!.childNodes[index];
    while(node && !isTextNode(node)) {
      node = node.firstChild;
    }
    return node;
  }
  split(at: number): {left: RichText, right: RichText} {
    const leftContent = this.content.substring(0, at);
    const rightContent = this.content.substring(at);
    this.content = leftContent;
    const right = new RichText(rightContent);
    this.parent?.addChild(right, this.parent?.children.indexOf(this) + 1);
    return {left: this, right};
  }

}
