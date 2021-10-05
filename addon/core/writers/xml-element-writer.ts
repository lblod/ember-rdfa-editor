import Writer from "@lblod/ember-rdfa-editor/core/writers/writer";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import XmlNodeWriter from "@lblod/ember-rdfa-editor/core/writers/xml-node-writer";

export default class XmlElementWriter implements Writer<ModelElement, Element> {
  constructor(private document: XMLDocument) {}

  write(modelElement: ModelElement): Element {
    const el = this.document.createElement(modelElement.type);
    const nodeWriter = new XmlNodeWriter(this.document);
    for (const [key, value] of modelElement.attributeMap.entries()) {
      el.setAttribute(key, value);
    }

    for(const child of modelElement.children) {
      const childNode = nodeWriter.write(child);
      el.appendChild(childNode);
    }

    return el;
  }
}
