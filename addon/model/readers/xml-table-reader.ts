import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import {XmlNodeRegistry} from "@lblod/ember-rdfa-editor/model/readers/xml-reader";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import XmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/xml-node-reader";

export default class XmlTableReader implements Reader<Element, ModelTable, void> {
  constructor(private elementRegistry: XmlNodeRegistry<ModelElement>, private textRegistry: XmlNodeRegistry<ModelText>) {
  }

  read(from: Element): ModelTable {
    const table = new ModelTable();
    const nodeReader = new XmlNodeReader(this.elementRegistry, this.textRegistry);

    for (const attribute of from.attributes) {
      if (attribute.name === "__id") {
        this.elementRegistry[attribute.value] = table;
      } else {
        table.setAttribute(attribute.name, attribute.value);
      }
    }

    for (const childNode of from.childNodes) {
      const child = nodeReader.read(childNode);
      if (child) {
        table.addChild(child);
      }
    }

    return table;
  }
}
