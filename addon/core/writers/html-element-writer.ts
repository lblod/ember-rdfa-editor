import Writer from "@lblod/ember-rdfa-editor/core/writers/writer";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default class HtmlElementWriter implements Writer<ModelElement, HTMLElement> {
  constructor(private model: EditorModel) {}

  write(modelNode: ModelElement): HTMLElement {
    const result = document.createElement(modelNode.type);

    // This will disable the selection of multiple cells on table.
    // Idea reverse-engineered from readctor.
    if (modelNode.type === "table") {
      result.contentEditable = "false";
    }
    if (modelNode.type === "td" || modelNode.type === "th") {
      result.contentEditable = "true";
    }
    this.model.bindNode(modelNode, result);

    for (const item of modelNode.attributeMap.entries()){
      result.setAttribute(item[0], item[1]);
    }

    return result;
  }
}
