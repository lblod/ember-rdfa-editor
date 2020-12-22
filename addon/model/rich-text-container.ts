import RichElement from "@lblod/ember-rdfa-editor/model/rich-element";
import RichText from "@lblod/ember-rdfa-editor/model/rich-text";

export class RichTextContainer extends RichElement<RichText> {
  addChild(child: RichText, index: number = this.children.length) {
    super.addChild(child, index);
    child.parent = this;
  }

}
