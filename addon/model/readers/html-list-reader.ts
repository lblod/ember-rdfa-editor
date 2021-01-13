import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import Model from "@lblod/ember-rdfa-editor/model/model";
import HtmlElementReader from "@lblod/ember-rdfa-editor/model/readers/html-element-reader";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {invisibleSpace} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export default class HtmlListReader implements Reader<HTMLUListElement | HTMLOListElement, ModelElement> {
  constructor(private model: Model, private elementReader: HtmlElementReader) {
  }
  read(from: HTMLUListElement | HTMLOListElement): ModelElement {

    const wrapper = this.elementReader.read(from);
    if(!from.childNodes.length) {
      const emptyText = new ModelText(invisibleSpace);
      wrapper.addChild(emptyText);
    }
    return wrapper;
  }

}
