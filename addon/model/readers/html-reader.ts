import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/html-node-reader";
import Model from "@lblod/ember-rdfa-editor/model/model";
import { calculateRdfaPrefixes } from "../util/rdfa-utils";

export class HtmlReaderContext {
  private readonly _textAttributes: Map<string, string>;
  private readonly _model: Model;
  private _rdfaPrefixes: Map<string, string>;

  constructor(model: Model, rdfaPrefixes: Map<string,string> = new Map<string,string>()) {
    this._textAttributes = new Map<string, string>();
    this._model = model;
    this._rdfaPrefixes = rdfaPrefixes;
  }

  get model() {
    return this._model;
  }

  bindNode(modelNode: ModelNode, domNode: Node) {
    this.model.bindNode(modelNode, domNode);
  }

  get textAttributes() {
    return this._textAttributes;
  }

  get rdfaPrefixes() {
    return this._rdfaPrefixes;
  }
}

/**
 * Top-level reader for HTML documents
 */
export default class HtmlReader implements Reader<Node, ModelNode[], void> {

  constructor(private model: Model) {
  }

  read(from: Node): ModelNode[] {
    from.normalize();
    const prefixes = calculateRdfaPrefixes(from);
    const context = new HtmlReaderContext(this.model, prefixes);
    const nodeReader = new HtmlNodeReader();
    return nodeReader.read(from, context);
  }

}
