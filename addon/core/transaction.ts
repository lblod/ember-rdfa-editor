import State, { cloneState } from '@lblod/ember-rdfa-editor/core/state';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { MarkSet } from '../model/mark';
import ModelNode from '../model/model-node';
import ModelSelection from '../model/model-selection';
import InsertTextOperation from '../model/operations/insert-text-operation';
import Operation from '../model/operations/operation';
import RangeMapper from '../model/range-mapper';
import HtmlReader, { HtmlReaderContext } from '../model/readers/html-reader';
import SelectionReader from '../model/readers/selection-reader';
import { getWindowSelection } from '../utils/dom-helpers';
import { EditorPlugin } from '../utils/editor-plugin';
import { NotImplementedError } from '../utils/errors';
import { View } from './view';

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
    const selectionReader = new SelectionReader();
    const newSelection = selectionReader.read(view, getWindowSelection());

    this.workingCopy.document = newVdom;
    this.workingCopy.selection = newSelection;
    this.needsToWrite = true;
  }

  apply(): State {
    return this.workingCopy;
  }

  insertText({ range, text, marks }: TextInsertion) {
    const operation = new InsertTextOperation(
      undefined,
      range.clone(this.workingCopy.document),
      text,
      marks || new MarkSet()
    );
    operation.execute();
    console.log(this.workingCopy.document.toXml())
  }

  setSelection(selection: ModelSelection) {
    const clone = selection.clone(this.workingCopy.document);
    if (!clone.sameAs(this.workingCopy.selection)) {
      this.needsToWrite = true;
    }
    this.workingCopy.selection = clone;
  }
}
