import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import XmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/xml-node-reader";
import {XmlNodeRegistry} from "@lblod/ember-rdfa-editor/model/readers/xml-reader";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

export default class XmlElementReader implements Reader<Element, ModelElement> {
  constructor(private elementRegistry: XmlNodeRegistry<ModelElement>, private textRegistry: XmlNodeRegistry<ModelText>) {
  }

  read(from: Element): ModelElement {
    const rslt = new ModelElement(from.tagName as keyof HTMLElementTagNameMap);
    const nodeReader = new XmlNodeReader(this.elementRegistry, this.textRegistry);
    for (const attribute of from.attributes) {
      if (attribute.name === "__id") {
        this.elementRegistry[attribute.value] = rslt;
      } else {
        rslt.setAttribute(attribute.name, attribute.value);

      }
    }
    for (const childNode of from.childNodes) {
      const child = nodeReader.read(childNode);
      if (child) {
        rslt.addChild(child);
      }
    }
    return rslt;
  }

}
