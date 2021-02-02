import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelElement, {ElementType} from "@lblod/ember-rdfa-editor/model/model-element";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export default class HtmlElementReader implements Reader<HTMLElement, ModelElement> {
  constructor(private model: Model) {
  }
  read(from: HTMLElement): ModelElement {
    const result = new ModelElement(tagName(from) as ElementType);
    for (const attr of from.attributes) {
      result.setAttribute(attr.name, attr.value);
    }
    return result;
  }

}
