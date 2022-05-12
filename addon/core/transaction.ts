import State from '@lblod/ember-rdfa-editor/core/state';
import { EventWithState } from '@lblod/ember-rdfa-editor/components/ce/input-handler';
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import SelectionReader from "@lblod/ember-rdfa-editor/model/readers/selection-reader";
import Operation from '../model/operations/operation';
import InsertTextOperation from '../model/operations/insert-text-operation';
import { MarkSet } from '../model/mark';
import RangeMapper from '../model/range-mapper';
import ModelPosition from '../model/model-position';

interface TextInsertion {
  range: ModelRange;
  text: string;
  marks?: MarkSet;
}

export default class Transaction {

  initialState: State
  needsToWrite: boolean;
  operations: Operation[];
  rangeMapper: RangeMapper;

  constructor(state: State) {
    this.initialState = state;
    this.needsToWrite = false;
    this.operations = [];
    this.rangeMapper = new RangeMapper();
  }

  apply(): State {
    if(this.operations.length === 0) {
      return this.initialState;
    }
    let currentState = this.initialState;
    this.operations[0].range = this.cloneRange(this.operations.[0]);



    for (const op of this.operations) {
      op.range =



    }

  };

  insertText({range, text, marks}: TextInsertion) {
    const operation = new InsertTextOperation(undefined, range, text, marks || new MarkSet());
    this.operations.push(operation);
  }

  cloneRange(range: ModelRange): ModelRange {
    const newRoot = range.root.clone();
    const newStart = range.start.clone(newRoot);
    const newEnd = range.end.clone(newRoot);

    return new ModelRange(newStart, newEnd);

  }


}
function asModelRange(domRange: StaticRange): ModelRange {
  const selectionReader =

}

export function insertText({
  range, text, state
}: {range: ModelRange, text: string, state: State}): Transaction {
  return {
    initialState: state;
    apply(): State {
      return {

      }

    },
    needsToWrite: false

  }


}


export function identity(state: State): Transaction {
  return {
    initialState: state,
    apply(): State {
      return state;
    },
    needsToWrite: false,
  };
}
