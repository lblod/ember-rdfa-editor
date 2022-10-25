import {
  BaseStep,
  StepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import State, { cloneStateShallow } from '@lblod/ember-rdfa-editor/core/state';
import {
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { LeftOrRight } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import InsertOperation from '@lblod/ember-rdfa-editor/core/model/operations/insert-operation';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';

export interface ReplaceStepArgs {
  initialState: State;
  range: SimpleRange;
  nodes?: ModelNode[];
}

export default class ReplaceStep implements BaseStep {
  private readonly _type: StepType = 'replace-step';
  private initialState: State;
  private range: SimpleRange;
  private nodes: ModelNode[];

  constructor({ initialState, range, nodes = [] }: ReplaceStepArgs) {
    this.initialState = initialState;
    this.range = range;
    this.nodes = nodes;
  }

  get type() {
    return this._type;
  }

  getResult(): StepResult {
    const resolvedRange = simpleRangeToModelRange(
      this.range,
      this.initialState.document
    );
    let newRoot;
    const commonAncestors = resolvedRange.getCommonAncestorChain();
    const resultState = cloneStateShallow(this.initialState);
    if (commonAncestors.length === 1) {
      newRoot = commonAncestors[0].clone();
    } else {
      let cur = commonAncestors[0];
      let curClone = commonAncestors[0].shallowClone();
      newRoot = curClone;
      for (const ancestor of commonAncestors.slice(
        1,
        commonAncestors.length - 1
      )) {
        const ancestorClone = ancestor.shallowClone();
        for (const child of cur.children) {
          if (child === ancestor) {
            curClone.addChild(ancestorClone);
          } else {
            curClone.addChild(child);
          }
        }
        cur = ancestor;
        curClone = ancestorClone;
      }
      const last = commonAncestors[commonAncestors.length - 1];
      for (const child of cur.children) {
        if (child === last) {
          curClone.addChild(last.clone());
        } else {
          curClone.addChild(child);
        }
      }
    }
    const op = new InsertOperation(
      newRoot,
      undefined,
      simpleRangeToModelRange(this.range, newRoot),
      ...this.nodes
    );
    op.execute();
    resultState.document = newRoot;
    return { state: resultState };
  }

  mapPosition(position: ModelPosition, _bias?: LeftOrRight): ModelPosition {
    return position;
  }

  mapRange(range: ModelRange, _bias?: LeftOrRight): ModelRange {
    return range;
  }
}
