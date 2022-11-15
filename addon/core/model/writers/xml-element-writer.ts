import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import XmlNodeWriter from '@lblod/ember-rdfa-editor/core/model/writers/xml-node-writer';
import { XmlWriterContext } from '@lblod/ember-rdfa-editor/core/model/writers/xml-writer';

export default class XmlElementWriter {
  constructor(private document: XMLDocument) {}

  write(modelElement: ModelElement, context: XmlWriterContext): Element {
    const el = this.document.createElement(modelElement.type);
    const nodeWriter = new XmlNodeWriter(this.document);
    for (const [key, value] of modelElement.attributeMap.entries()) {
      el.setAttribute(key, value);
    }
    const startPos = context.currentPos.toString(10);

    for (const child of modelElement.children) {
      const childNode = nodeWriter.write(child, context);
      el.appendChild(childNode);
    }
    const endPos = context.currentPos.toString(10);
    if (context.showPositions) {
      el.setAttribute('__r', `${startPos}-${endPos}`);
    }

    return el;
  }
}
