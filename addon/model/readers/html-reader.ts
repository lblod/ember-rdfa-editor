import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import HtmlNodeReader from '@lblod/ember-rdfa-editor/model/readers/html-node-reader';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { calculateRdfaPrefixes } from '../util/rdfa-utils';
import { SpecAttributes } from '@lblod/ember-rdfa-editor/model/marks-registry';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { AttributeSpec, MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import NodeView from '@lblod/ember-rdfa-editor/model/node-view';

export class HtmlReaderContext {
  private readonly _textAttributes: Map<string, string>;
  private readonly _model: Model;
  private _rdfaPrefixes: Map<string, string>;
  private _shouldConvertWhitespace: boolean;
  activeMarks: Set<SpecAttributes> = new Set<SpecAttributes>();
  markViewRootStack: Node[] = [];

  constructor(
    model: Model,
    rdfaPrefixes: Map<string, string> = new Map<string, string>(),
    shouldConvertWhitespace = false
  ) {
    this._textAttributes = new Map<string, string>();
    this._model = model;
    this._rdfaPrefixes = rdfaPrefixes;
    this._shouldConvertWhitespace = shouldConvertWhitespace;
  }

  get model() {
    return this._model;
  }

  registerNodeView(modelNode: ModelNode, view: NodeView) {
    this.model.registerNodeView(modelNode, view);
  }

  get shouldConvertWhitespace() {
    return this._shouldConvertWhitespace;
  }

  get textAttributes() {
    return this._textAttributes;
  }

  get rdfaPrefixes() {
    return this._rdfaPrefixes;
  }

  matchMark(node: Node): Set<SpecAttributes> {
    return this.model.marksRegistry.matchMarkSpec(node);
  }

  addMark<A extends AttributeSpec>(
    node: ModelText,
    spec: MarkSpec<A>,
    attributes: A
  ) {
    return this._model.marksRegistry.addMark(node, spec, attributes);
  }
}

/**
 * Top-level reader for HTML documents
 */
export default class HtmlReader implements Reader<Node, ModelNode[], boolean> {
  constructor(private model: Model) {}

  read(from: Node, shouldConvertWhitespace = false): ModelNode[] {
    from.normalize();
    const prefixes = calculateRdfaPrefixes(from);
    const context = new HtmlReaderContext(
      this.model,
      prefixes,
      shouldConvertWhitespace
    );
    const nodeReader = new HtmlNodeReader();
    return nodeReader.read(from, context);
  }
}
