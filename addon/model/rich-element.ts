import TextAttribute from "@lblod/ember-rdfa-editor/model/text-attribute";
import {RichNode} from "@lblod/ember-rdfa-editor/utils/ce/node-walker";
import {RichNodeContent} from "@lblod/marawa/rich-node";

// TODO we dont want to support every element type in the model
export type RichElementType = keyof HTMLElementTagNameMap;


export default class RichElement extends RichNode {
  type: RichElementType;
  text: string = "";
  bold: TextAttribute;
  children: RichElement[];

  constructor(type: RichElementType) {
    super();
    this.type = type;
    this.bold = new TextAttribute("bold");
    this.children = [];
  }


}
