import Writer from "@lblod/ember-rdfa-editor/core/writers/writer";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

const INTERNAL_ATTRIBUTES = ['data-editor-highlight', 'data-editor-position-level', 'data-editor-rdfa-position-level'];

export default class UnpollutedHtmlElementWriter implements Writer<ModelElement, HTMLElement> {
  constructor(private model: EditorModel) {}

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
