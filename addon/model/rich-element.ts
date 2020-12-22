import RichElementContainer from "@lblod/ember-rdfa-editor/model/rich-element-container";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import RichText from "@lblod/ember-rdfa-editor/model/rich-text";

// TODO we dont want to support every element type in the model
export type RichElementType = keyof HTMLElementTagNameMap;

export default abstract class RichElement<T extends RichElementContainer | RichTextContainer | RichText> {
  type: RichElementType;
  children: T[]
  parent: RichElementContainer | null = null;
  boundNode: HTMLElement | null = null;

  constructor(type: RichElementType = "span") {
    this.type = type;
    this.children = [];
  }

  addChild(child: T, index = this.children.length) {
    this.children.splice(index,0, child);
  }

}
