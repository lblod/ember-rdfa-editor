import RichElementContainer from "@lblod/ember-rdfa-editor/model/rich-element-container";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import RichText from "@lblod/ember-rdfa-editor/model/rich-text";

// TODO we dont want to support every element type in the model
export type RichElementType = keyof HTMLElementTagNameMap;

/**
 * Superclass for a model element
 * TODO: is a bit of a typing disaster and needs rethinking
 */
export default abstract class RichElement<T extends RichElementContainer | RichTextContainer | RichText> {
  type: RichElementType;
  children: T[]
  parent: RichElementContainer | null = null;
  boundNode: HTMLElement | null = null;
  htmlAttributes?: NamedNodeMap;
  next: RichElement<T> | null = null;
  previous: RichElement<T> | null = null;

  constructor(type: RichElementType = "span") {
    this.type = type;
    this.children = [];
  }

  get lastChild(): T | null {
    return this.children[this.children.length - 1];
  }

  get firstChild(): T | null {
    return this.children[0];
  }
  addChild(child: T, index = this.children.length) {
    this.children.splice(index,0, child);
  }

}
