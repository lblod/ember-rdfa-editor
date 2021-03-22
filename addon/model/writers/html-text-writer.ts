import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlTextWriter implements Writer<ModelText, Node | null> {
  static attributeMap: Map<TextAttribute, keyof HTMLElementTagNameMap> = new Map<TextAttribute, keyof HTMLElementTagNameMap>(
    [
      ["bold", "strong"],
      ["italic", "em"],
      ["underline", "u"],
      ["strikethrough", "del"],
      ["highlighted", "span"]
    ]
  )
  constructor(private model: Model) {
  }
  write(modelNode: ModelText): Node | null {
    if(modelNode.length === 0 && this.model.selection.anchor?.parent !== modelNode) {
      return null;
    }
    const result = new Text(modelNode.content);
    this.model.bindNode(modelNode, result);
    const top = document.createElement("span");
    let wrapper = top;

    for (const entry of modelNode.getTextAttributes()) {
      if(entry[1] && HtmlTextWriter.attributeMap.has(entry[0])) {
        const wrappingElement = document.createElement(HtmlTextWriter.attributeMap.get(entry[0])!);
        if (entry[0] === "highlighted") {
          wrappingElement.setAttribute('data-editor-highlight', "true");
        }
        wrapper.appendChild(wrappingElement);
        wrapper = wrappingElement;

      }
    }
    wrapper.appendChild(result);
    return top.firstChild!;
  }
}
