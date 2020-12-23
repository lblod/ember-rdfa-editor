import RichText from "@lblod/ember-rdfa-editor/model/rich-text";
import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";

/**
 * Reader responsible for reading HTML Text nodes
 */
export default class HtmlTextReader implements Reader<Text, RichTextContainer> {
  read(from: Text): RichTextContainer {
    const text = new RichText(from.textContent || "");
    const container = new RichTextContainer();
    container.addChild(text);
    return container;
  }
}
