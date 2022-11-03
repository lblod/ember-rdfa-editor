import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { Mark, MarkSpec } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import { UnconfinedRangeError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import {
  CORE_OWNER,
  INVISIBLE_SPACE,
} from '@lblod/ember-rdfa-editor/utils/constants';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { SimpleRangeMapper } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import { AttributeSpec } from '../../../utils/render-spec';
import GenTreeWalker from '../../../utils/gen-tree-walker';
import Operation from './operation';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import {
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';

export type MarkAction = 'add' | 'remove';
export default class MarkOperation extends Operation {
  private _action: MarkAction;
  private _spec: MarkSpec;
  private _attributes: AttributeSpec;

  constructor(
    root: ModelElement,
    eventbus: EventBus | undefined,
    range: SimpleRange,
    spec: MarkSpec,
    attributes: AttributeSpec,
    action: MarkAction
  ) {
    super(root, eventbus, range);
    this._spec = spec;
    this._attributes = attributes;
    this._action = action;
  }

  get action(): MarkAction {
    return this._action;
  }

  set action(value: MarkAction) {
    this._action = value;
  }

  get attributes(): AttributeSpec {
    return this._attributes;
  }

  set attributes(value: AttributeSpec) {
    this._attributes = value;
  }

  get spec(): MarkSpec {
    return this._spec;
  }

  set spec(value: MarkSpec) {
    this._spec = value;
  }

  canExecute() {
    return true;
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

  execute() {
    if (!this.canExecute()) {
      throw new UnconfinedRangeError();
    }
    const modelRange = simpleRangeToModelRange(this.range, this.root);

    if (modelRange.collapsed) {
      modelRange.start.split();

      const referenceNode =
        modelRange.start.nodeBefore() || modelRange.start.nodeAfter()!;
      const node = new ModelText(INVISIBLE_SPACE);
      if (ModelNode.isModelText(referenceNode)) {
        node.marks = referenceNode.marks.clone();
      }
      //insert new textNode with property set
      this.markAction(node, this.spec, this.attributes, this.action);
      const insertionIndex = modelRange.start.parent.offsetToIndex(
        modelRange.start.parentOffset
      );
      modelRange.start.parent.addChild(node, insertionIndex);

      //put the cursor inside that node
      const newRange = ModelRange.fromInNode(this.root, node, 1, 1);
      return {
        defaultRange: newRange,
        mapper: new SimpleRangeMapper(),
        overwrittenNodes: [],
        insertedNodes: [node],
        markCheckNodes: [node],
      };
    } else {
      OperationAlgorithms.splitText(this.root, this.range.start);
      OperationAlgorithms.splitText(this.root, this.range.end);

      const walker = GenTreeWalker.fromRange({
        range: modelRange,
        filter: toFilterSkipFalse<ModelNode>(ModelNode.isModelText),
      });
      const textNodes = [...walker.nodes()] as ModelText[];
      const _markCheckNodes: ModelNode[] = [...textNodes];

      for (const node of textNodes) {
        this.markAction(node, this.spec, this.attributes, this.action);
      }
      OperationAlgorithms.mergeTextNodes(this.root, textNodes);
      const before = modelRange.start.nodeBefore();
      const after = modelRange.end.nodeAfter();
      if (before) {
        if (ModelNode.isModelText(before)) {
          OperationAlgorithms.mergeTextNodes(this.root, [before]);
        }

        _markCheckNodes.push(before);
      }
      if (after) {
        _markCheckNodes.push(after);
      }
      return {
        defaultRange: simpleRangeToModelRange(this.range, this.root),
        mapper: new SimpleRangeMapper(),
        overwrittenNodes: [],
        insertedNodes: [],
        markCheckNodes: _markCheckNodes,
      };
    }
  }
}
