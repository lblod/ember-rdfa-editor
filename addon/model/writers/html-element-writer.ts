import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class HtmlElementWriter implements Writer<ModelElement, HTMLElement> {
  constructor(private model: Model) {
  }
  write(modelNode: ModelElement): HTMLElement {
    const result = document.createElement(modelNode.type);
    //this will disable the selection of multiple cells on table
    //idea reverse-engineered from readctor
    if(modelNode.type === "table") {
      result.contentEditable = "false";
    }
    if(modelNode.type === "td" || modelNode.type === "th") {
      result.contentEditable = "true";
    }
    this.model.bindNode(modelNode, result);

    for (const item of modelNode.attributeMap.entries()){
      result.setAttribute(item[0], item[1]);
    }
    return result;
  }

}
