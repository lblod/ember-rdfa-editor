import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import { SimpleRangeMapper } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import {
  modelRangeToSimpleRange,
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import { Mark, MarkSpec } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/utils/render-spec';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import {
  CORE_OWNER,
  INVISIBLE_SPACE,
} from '@lblod/ember-rdfa-editor/utils/constants';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import GenTreeWalker from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';

export type MarkAction = 'add' | 'remove';
interface Args {
  range: SimpleRange;
  spec: MarkSpec;
  attributes: AttributeSpec;
  action: MarkAction;
}

export default class MarkStep implements OperationStep {
  readonly type: StepType = 'mark-step';

  private readonly args: Args;

  constructor(args: Args) {
    this.args = args;
  }

  markAction(
    node: ModelText,
    spec: MarkSpec,
    attributes: AttributeSpec,
    action: MarkAction
  ) {
    if (action === 'add') {
      node.addMark(new Mark(spec, attributes));
    } else {
      node.removeMarkByName(`${spec.name}-${attributes.setBy || CORE_OWNER}`);
    }
  }

  getResult(initialState: State): OperationStepResult {
    const { range, spec, attributes, action } = this.args;
    const resultState = cloneStateInRange(range, initialState);
    const root = resultState.document;

    const modelRange = simpleRangeToModelRange(range, root);

    if (modelRange.collapsed) {
      OperationAlgorithms.splitText(root, range.start);

      const referenceNode =
        modelRange.start.nodeBefore() || unwrap(modelRange.start.nodeAfter());
      const node = new ModelText(INVISIBLE_SPACE);
      if (ModelNode.isModelText(referenceNode)) {
        node.marks = referenceNode.marks.clone();
      }
      //insert new textNode with property set
      this.markAction(node, spec, attributes, action);
      const { mapper } = OperationAlgorithms.insert(root, range, node);

      //put the cursor inside that node
      const newRange = ModelRange.fromInNode(root, node, 1, 1);
      return {
        defaultRange: modelRangeToSimpleRange(newRange),
        mapper,
        state: resultState,
      };
    } else {
      OperationAlgorithms.splitText(root, range.start);
      OperationAlgorithms.splitText(root, range.end);

      const walker = GenTreeWalker.fromRange({
        range: modelRange,
        filter: toFilterSkipFalse<ModelNode>(ModelNode.isModelText),
      });
      const textNodes = [...walker.nodes()] as ModelText[];

      for (const node of textNodes) {
        this.markAction(node, spec, attributes, action);
      }
      OperationAlgorithms.mergeTextNodes(root, textNodes);
      const before = modelRange.start.nodeBefore();
      if (before) {
        if (ModelNode.isModelText(before)) {
          OperationAlgorithms.mergeTextNodes(root, [before]);
        }
      }
      return {
        defaultRange: range,
        mapper: new SimpleRangeMapper(),
        state: resultState,
      };
    }
  }
}
