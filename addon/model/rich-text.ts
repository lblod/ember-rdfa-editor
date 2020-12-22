import WrappingAttribute from "@lblod/ember-rdfa-editor/model/wrapping-attribute";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";

export type TextAttribute = "bold" | "italic" | "underline" | "strikethrough";

export default class RichText {
  private attributeMap: Map<TextAttribute, boolean>;
  private _content: string;
  private _parent: RichTextContainer | null = null;

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

  setAttribute(name: TextAttribute, value: boolean) {
    this.attributeMap.set(name, value);
  }
  getAttribute(name: TextAttribute): boolean {
    return this.attributeMap.get(name) || false;
  }

  get attributes(): Map<TextAttribute, boolean> {
    return this.attributeMap;
  }

}
