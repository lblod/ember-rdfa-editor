import XmlReader, {XmlReaderResult} from "@lblod/ember-rdfa-editor/model/readers/xml-reader";

export function parseXml(xml: string): XmlReaderResult {

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  const reader = new XmlReader();
  return reader.read(doc.firstElementChild!);
}
