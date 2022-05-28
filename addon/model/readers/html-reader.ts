import { AttributeSpec, MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import MarksRegistry, {
  SpecAttributes,
} from '@lblod/ember-rdfa-editor/model/marks-registry';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import HtmlNodeReader from '@lblod/ember-rdfa-editor/model/readers/html-node-reader';
import { calculateRdfaPrefixes } from '../util/rdfa-utils';

export interface HtmlReaderContextArgs {
  rdfaPrefixes?: Map<string, string>;
  shouldConvertWhitespace?: boolean;
  marksRegistry: MarksRegistry;
}
export class HtmlReaderContext {
  private readonly _textAttributes: Map<string, string>;
  private marksRegistry: MarksRegistry;
  private _rdfaPrefixes: Map<string, string>;
  private _shouldConvertWhitespace: boolean;
  activeMarks: Set<SpecAttributes> = new Set<SpecAttributes>();
  markViewRootStack: Node[] = [];

  constructor({
    marksRegistry,
    rdfaPrefixes = new Map<string, string>(),
    shouldConvertWhitespace = false,
  }: HtmlReaderContextArgs) {
    this._textAttributes = new Map<string, string>();
    this._rdfaPrefixes = rdfaPrefixes;
    this._shouldConvertWhitespace = shouldConvertWhitespace;
    this.marksRegistry = marksRegistry;
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
  set rdfaPrefixes(value: Map<string, string>) {
    this._rdfaPrefixes = value;
  }

  matchMark(node: Node): Set<SpecAttributes> {
    return this.marksRegistry.matchMarkSpec(node);
  }

  addMark<A extends AttributeSpec>(
    node: ModelText,
    spec: MarkSpec<A>,
    attributes: A
  ) {
    return this.marksRegistry.addMark(node, spec, attributes);
  }
}

/**
 * Top-level reader for HTML documents
 */
export default class HtmlReader {
  read(from: Node, context: HtmlReaderContext): ModelNode[] {
    from.normalize();
    const prefixes = calculateRdfaPrefixes(from);
    context.rdfaPrefixes = prefixes;
    const nodeReader = new HtmlNodeReader();
    return nodeReader.read(from, context);
  }
}
