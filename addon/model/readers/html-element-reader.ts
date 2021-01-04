import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelElement, {ElementType} from "@lblod/ember-rdfa-editor/model/model-element";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class HtmlElementReader implements Reader<HTMLElement, ModelElement> {
  constructor(private model: Model) {
  }
  read(from: HTMLElement): ModelElement {
    const result = new ModelElement(from.tagName as ElementType);
    this.model.bindNode(result, from);
    for (const attr of from.attributes) {
      result.setAttribute(attr.name, attr.value);
    }
    return result;
  }

}
