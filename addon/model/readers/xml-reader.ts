import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import XmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/xml-node-reader";
import {ParseError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export type XmlNodeRegistry<T extends ModelNode> = Record<string, T>;
export type XmlReaderResult = { root: ModelNode, elements: XmlNodeRegistry<ModelElement>, textNodes: XmlNodeRegistry<ModelText> }
export default class XmlReader implements Reader<Node, XmlReaderResult> {
  read(from: Node): XmlReaderResult {
    const elementRegistry = {};
    const textRegistry = {};
    const reader = new XmlNodeReader(elementRegistry, textRegistry);
    const root = reader.read(from);
    if (!root) {
      throw new ParseError("Xml without a root");
    }
    return {root, elements: elementRegistry, textNodes: textRegistry};
  }

}

