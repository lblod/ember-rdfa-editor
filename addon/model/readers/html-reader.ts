import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/html-node-reader";
import Model from "@lblod/ember-rdfa-editor/model/model";

export class HtmlReaderContext {
  private readonly _textAttributes: Map<string, string>;
  private readonly _model: Model;

  constructor(model: Model) {
    this._textAttributes = new Map<string, string>();
    this._model = model;
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
}

/**
 * Top-level reader for HTML documents
 */
export default class HtmlReader implements Reader<Node, ModelNode | null, void> {

  constructor(private model: Model) {
  }

  read(from: Node): ModelNode | null {
    from.normalize();
    const context = new HtmlReaderContext(this.model);
    const nodeReader = new HtmlNodeReader();
    return nodeReader.read(from, context);
  }

}
