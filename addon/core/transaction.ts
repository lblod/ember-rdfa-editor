import State, { cloneState } from '@lblod/ember-rdfa-editor/core/state';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { MarkSet } from '../model/mark';
import ModelNode from '../model/model-node';
import InsertTextOperation from '../model/operations/insert-text-operation';
import Operation from '../model/operations/operation';
import RangeMapper from '../model/range-mapper';
import HtmlReader, { HtmlReaderContext } from '../model/readers/html-reader';
import { EditorPlugin } from '../utils/editor-plugin';
import { NotImplementedError } from '../utils/errors';
import { View } from "./View";

interface TextInsertion {
  range: ModelRange;
  text: string;
  marks?: MarkSet;
}

export default class Transaction {
  initialState: State;
  private workingCopy: State;
  needsToWrite: boolean;
  operations: Operation[];
  rangeMapper: RangeMapper;

  constructor(state: State) {
    this.initialState = state;
    this.workingCopy = cloneState(state);
    this.needsToWrite = false;
    this.operations = [];
    this.rangeMapper = new RangeMapper();
  }
  setPlugins(plugins: EditorPlugin[]): void {
    this.workingCopy.plugins = plugins;
  }

  readFromView(view: View): void {
    const htmlReader = new HtmlReader();
    const context = new HtmlReaderContext({
      view,
      marksRegistry: this.workingCopy.marksRegistry,
    });
    const parsedNodes = htmlReader.read(view.domRoot, context);
    if (parsedNodes.length !== 1) {
      throw new NotImplementedError();
    }
    const newVdom = parsedNodes[0];
    if (!ModelNode.isModelElement(newVdom)) {
      throw new NotImplementedError();
    }
    this.workingCopy.modelRoot = newVdom;
  }

  apply(): State {
    return this.workingCopy;
  }

  insertText({ range, text, marks }: TextInsertion) {
    const operation = new InsertTextOperation(
      undefined,
      range,
      text,
      marks || new MarkSet()
    );
    this.operations.push(operation);
  }

  cloneRange(range: ModelRange): ModelRange {
    const newRoot = range.root.clone();
    const newStart = range.start.clone(newRoot);
    const newEnd = range.end.clone(newRoot);

    return new ModelRange(newStart, newEnd);
  }
}
