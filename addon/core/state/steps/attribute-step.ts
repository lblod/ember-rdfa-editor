import {
  BaseStep,
  StepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import {
  EMPTY_MAPPER,
  LeftOrRight,
} from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import {
  SimplePosition,
  simplePosToModelPos,
} from '@lblod/ember-rdfa-editor/core/model/simple-position';
import { SimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import State, { createState } from '@lblod/ember-rdfa-editor/core/state';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import unwrap from '@lblod/ember-rdfa-editor/utils/unwrap';

interface AddArgs {
  action: 'set';
  nodePos: SimplePosition;
  key: string;
  value: string;
}

interface RemoveArgs {
  action: 'remove';
  nodePos: SimplePosition;
  key: string;
}

export default class AttributeStep implements BaseStep {
  readonly type: StepType = 'attribute-step';
  private nodePos: SimplePosition;
  private key: string;
  private action: 'remove' | 'set';
  private value?: string;

  constructor(args: AddArgs | RemoveArgs) {
    this.nodePos = args.nodePos;
    this.key = args.key;
    this.action = args.action;
    if (args.action === 'set') {
      this.value = args.value;
    }
  }

  getResult(initialState: State): StepResult {
    const doc = initialState.document;
    const modelPos = simplePosToModelPos(this.nodePos, doc);
    const nodeToEdit = modelPos.nodeAfter();
    if (!nodeToEdit) {
      throw new AssertionError(
        'Could not find a node in the document at that position'
      );
    }
    let editedNode;
    if (!nodeToEdit.isLeaf && ModelNode.isModelElement(nodeToEdit)) {
      editedNode = nodeToEdit.shallowClone();
    } else {
      editedNode = nodeToEdit.clone();
    }
    if (this.action === 'set') {
      editedNode.attributeMap.set(this.key, unwrap(this.value));
    } else {
      editedNode.attributeMap.delete(this.key);
    }
    const newRoot = ModelNodeUtils.replaceNodeInTree(
      doc,
      nodeToEdit,
      editedNode
    );

    return {
      state: createState({ ...initialState, document: newRoot }),
      mapper: EMPTY_MAPPER,
      timestamp: new Date(),
    };
  }

  mapPosition(position: SimplePosition, bias?: LeftOrRight): SimplePosition {
    return position;
  }

  mapRange(range: SimpleRange, bias?: LeftOrRight): SimpleRange {
    return range;
  }
}
