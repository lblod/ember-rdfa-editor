import RichElement from "@lblod/ember-rdfa-editor/model/rich-element";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";

export default class RichElementContainer extends RichElement<RichElementContainer | RichTextContainer> {
  addChild(child: RichElementContainer | RichTextContainer, index: number = this.children.length) {
    super.addChild(child, index);
    child.parent = this;
  }

}
