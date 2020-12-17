import TextAttribute from "@lblod/ember-rdfa-editor/model/text-attribute";

// TODO we dont want to support every element type in the model
export type RichElementType = keyof HTMLElementTagNameMap;


export default class RichElement {
  type: RichElementType;
  text: string | null = null;
  bold: TextAttribute;
  children: RichElement[];

  constructor(type: RichElementType) {
    this.type = type;
    this.bold = new TextAttribute("bold");
    this.children = [];
  }


}
