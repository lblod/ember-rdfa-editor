import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import Model from "@lblod/ember-rdfa-editor/model/model";

const INTERNAL_ATTRIBUTES = ['data-editor-highlight', 'data-editor-position-level', 'data-editor-rdfa-position-level', 'contenteditable'];

export default class UnpollutedHtmlElementWriter implements Writer<ModelElement, HTMLElement> {
  constructor(private model: Model) {}

  write(modelNode: ModelElement): HTMLElement {
    const result = document.createElement(modelNode.type);

    for (const [key, value] of modelNode.attributeMap.entries()) {
      if (!INTERNAL_ATTRIBUTES.includes(key)) {
        result.setAttribute(key, value);
      }
    }
    return result;
  }
}
