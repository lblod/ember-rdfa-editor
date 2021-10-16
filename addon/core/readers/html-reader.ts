import Reader from "@lblod/ember-rdfa-editor/core/readers/reader";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/core/readers/html-node-reader";
import {calculateRdfaPrefixes} from "@lblod/ember-rdfa-editor/util/rdfa-utils";
import {RdfaParser} from "rdfa-streaming-parser";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";

export class HtmlReaderContext {
  private readonly _textAttributes: Map<string, string>;
  private _nodeMap: Map<Node, ModelNode>;
  private _rdfaPrefixes: Map<string, string>;
  private _rootNodes: ModelNode[];
  private rdfaParser: RdfaParser;

  constructor(rdfaPrefixes: Map<string, string> = new Map<string, string>()) {
    this._nodeMap = new Map<Node, ModelNode>();
    this._textAttributes = new Map<string, string>();
    this._rdfaPrefixes = rdfaPrefixes;
    this._rootNodes = [];
    this.rdfaParser = new RdfaParser({baseIRI: "https://example.com"});
    console.log(this.rdfaParser);
    this.rdfaParser.addListener("data", (data: unknown) => console.log("yeet", data));
    this.rdfaParser.addListener("error", (error: unknown) => console.log("skeet", error));
  }

  get rootNodes(): ModelNode[] {
    return this._rootNodes;
  }

  set rootNodes(value: ModelNode[]) {
    this._rootNodes = value;
  }

  get textAttributes() {
    return this._textAttributes;
  }

  get rdfaPrefixes() {
    return this._rdfaPrefixes;
  }

  get nodeMap(): Map<Node, ModelNode> {
    return this._nodeMap;
  }

  bindNode(modelNode: ModelNode, domNode: Node) {
    this._nodeMap.delete(domNode);
    modelNode.boundNode = domNode;
    this._nodeMap.set(domNode, modelNode);
  }

  onElementOpen(element: ModelElement) {
    this.rdfaParser.onTagOpen(element.type, Object.fromEntries(element.attributeMap));
  }

  onElementClose() {
    this.rdfaParser.onTagClose();
  }

  onText(text: ModelText) {
    this.rdfaParser.onText(text.content);
  }

}

/**
 * Top-level reader for HTML documents
 */
export default class HtmlReader implements Reader<Node, HtmlReaderContext, void> {


  read(from: Node): HtmlReaderContext {
    from.normalize();
    const prefixes = calculateRdfaPrefixes(from);
    const context = new HtmlReaderContext(prefixes);
    const nodeReader = new HtmlNodeReader();
    context.rootNodes = nodeReader.read(from, context);
    return context;
  }

}
