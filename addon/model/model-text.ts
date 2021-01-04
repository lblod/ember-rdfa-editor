import ModelNode, {ModelNodeType} from "@lblod/ember-rdfa-editor/model/model-node";
import {ModelError} from "@lblod/ember-rdfa-editor/utils/errors";

export type TextAttribute = "bold" | "italic" | "underline" | "strikethrough";

export default class ModelText extends ModelNode {
  nodeType: ModelNodeType = "TEXT";
  private _content: string;
  private _textAttributeMap: Map<TextAttribute, boolean>;

  constructor(content: string = "") {
    super();
    this._content = content;
    this._textAttributeMap = new Map<TextAttribute, boolean>();
  }

  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  get length() {
    return this._content.length;
  }

  get textAttributeMap(): Map<TextAttribute, boolean> {
    return this._textAttributeMap;
  }

  set textAttributeMap(value: Map<TextAttribute, boolean>) {
    this._textAttributeMap = value;
  }

  getTextAttribute(key: TextAttribute): boolean {
    return this._textAttributeMap.get(key) || false;
  }

  setTextAttribute(key: TextAttribute, value: boolean) {
    this._textAttributeMap.set(key, value);
  }

  toggleTextAttribute(key: TextAttribute) {
    this.setTextAttribute(key, !this.getTextAttribute(key));
  }

  insertTextNodeAt(index: number): ModelText {
    const {right} = this.split(index);
    return right.split(0).left;
  }

  clone(): ModelText {
    const result = new ModelText();
    result.attributeMap = new Map<string, string>(this.attributeMap);
    result.nodeType = this.nodeType;
    result.content = this.content;
    result.textAttributeMap = new Map<TextAttribute, boolean>(this.textAttributeMap);
    return result;

  }

  split(index: number): { left: ModelText, right: ModelText } {


    const leftContent = this.content.substring(0, index);
    const rightContent = this.content.substring(index);

    this.content = leftContent;
    const right = this.clone();
    right.content = rightContent;


    if (!this.parent) {
      throw new ModelError("splitting a node without a parent");
    }

    const childIndex = this.parent.children.indexOf(this);

    this.parent?.addChild(right, childIndex + 1);


    return {left: this, right};

  }

}
