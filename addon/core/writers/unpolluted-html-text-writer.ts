import {TextAttribute} from "@lblod/ember-rdfa-editor/core/model/model-text";
import HtmlTextWriter from "@lblod/ember-rdfa-editor/core/writers/html-text-writer";

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class UnpollutedHtmlTextWriter extends HtmlTextWriter {
  static attributeMap: Map<TextAttribute, keyof HTMLElementTagNameMap> = new Map<TextAttribute, keyof HTMLElementTagNameMap>(
    [
      ["bold", "strong"],
      ["italic", "em"],
      ["underline", "u"],
      ["strikethrough", "del"]
    ]
  );

  get attributeMap() {
    return UnpollutedHtmlTextWriter.attributeMap;
  }
}
