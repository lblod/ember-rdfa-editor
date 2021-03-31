import XmlReader, {XmlReaderResult} from "@lblod/ember-rdfa-editor/model/readers/xml-reader";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import XmlWriter from "@lblod/ember-rdfa-editor/model/writers/xml-writer";

export function parseXml(xml: string): XmlReaderResult {

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  const reader = new XmlReader();
  return reader.read(doc.firstElementChild!);
}

export function vdom(strings: TemplateStringsArray, ...expressions: any[]): XmlReaderResult {
  let xmlStr = '';

  for(let i = 0; i<expressions.length; i++){
    xmlStr += strings[i] + expressions[i];
  }
  xmlStr += strings[expressions.length];
  return parseXml(xmlStr);
}

export function printModel(modelNode: ModelNode) {
  const writer = new XmlWriter();
  return writer.write(modelNode);

}
