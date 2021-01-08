import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/rich-text";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

/**
 * Writer responsible for converting {@link RichText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlTextWriter implements Writer<ModelText, Node | null> {
  static attributeMap: Map<TextAttribute, keyof HTMLElementTagNameMap> = new Map<TextAttribute, keyof HTMLElementTagNameMap>(
    [
      ["bold", "strong"],
      ["italic", "em"],
      ["underline", "u"],
      ["strikethrough", "del"]
    ]
  )
  constructor(private model: Model) {
  }
  write(modelNode: ModelText): Node | null {
    if(modelNode.length === 0 && this.model.selection.anchor !== modelNode) {
      return null;
    }
    let result;
    // if(modelNode.content === "\n") {
    //   result = document.createElement("br");
    //
    // } else {
      result = new Text(modelNode.content);

    // }
    this.model.bindNode(modelNode, result);
    const top = document.createElement("span");
    let wrapper = top;

    for (const entry of modelNode.textAttributeMap.entries()) {
      if(entry[1] && HtmlTextWriter.attributeMap.has(entry[0])) {
        const wrappingElement = document.createElement(HtmlTextWriter.attributeMap.get(entry[0])!);
        wrapper.appendChild(wrappingElement);
        wrapper = wrappingElement;

      }
    }
    wrapper.appendChild(result);
    return top.firstChild!;
  }
}
