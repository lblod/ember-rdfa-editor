import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import {
  AttributeSpec,
  MarkSpec,
} from '@lblod/ember-rdfa-editor/model/markSpec';
import { UnconfinedRangeError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import {
  CORE_OWNER,
  INVISIBLE_SPACE,
} from '@lblod/ember-rdfa-editor/model/util/constants';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelTreeWalker, {
  FilterResult,
} from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import MarksRegistry from '@lblod/ember-rdfa-editor/model/marks-registry';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';

type MarkAction = 'add' | 'remove';
export default class MarkOperation extends Operation {
  private _action: MarkAction;
  private _spec: MarkSpec;
  private _attributes: AttributeSpec;
  private _registry: MarksRegistry;

  constructor(
    eventbus: EventBus,
    range: ModelRange,
    spec: MarkSpec,
    attributes: AttributeSpec,
    action: MarkAction,
    registry: MarksRegistry
  ) {
    super(eventbus, range);
    this._spec = spec;
    this._attributes = attributes;
    this._action = action;
    this._registry = registry;
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
      this._registry.addMark(node, spec, attributes);
    } else {
      this._registry.removeMarkByName(node, spec.name);
    }
  }

  execute(): ModelRange {
    if (!this.canExecute()) {
      throw new UnconfinedRangeError();
    }

    if (this.range.collapsed) {
      this.range.start.split();

      const referenceNode =
        this.range.start.nodeBefore() || this.range.start.nodeAfter()!;
      const node = new ModelText(INVISIBLE_SPACE);
      if (ModelNode.isModelText(referenceNode)) {
        node.marks = referenceNode.marks.clone();
      }
      //insert new textNode with property set
      this.markAction(node, this.spec, this.attributes, this.action);
      const insertionIndex = this.range.start.parent.offsetToIndex(
        this.range.start.parentOffset
      );
      this.range.start.parent.addChild(node, insertionIndex);

      //put the cursor inside that node
      const cursorPath = node.getOffsetPath();
      const newRange = ModelRange.fromPaths(
        this.range.root,
        cursorPath,
        cursorPath
      );
      this.eventBus.emit(
        new ContentChangedEvent({
          owner: CORE_OWNER,
          payload: {
            type: 'insert',
            oldRange: this.range,
            newRange,
            overwrittenNodes: [],
            insertedNodes: [node],
            _markCheckNodes: [node],
          },
        })
      );
      return newRange;
    } else {
      OperationAlgorithms.splitText(this.range.start);
      OperationAlgorithms.splitText(this.range.end);

      const walker = new ModelTreeWalker<ModelText>({
        range: this.range,
        filter: (node: ModelNode) => {
          return ModelNode.isModelText(node)
            ? FilterResult.FILTER_ACCEPT
            : FilterResult.FILTER_SKIP;
        },
      });
      const textNodes = Array.from(walker);

      for (const node of textNodes) {
        this.markAction(node, this.spec, this.attributes, this.action);
      }
      const before = this.range.start.nodeBefore();
      const after = this.range.end.nodeAfter();
      const _markCheckNodes: ModelNode[] = [...textNodes];
      if (before) {
        _markCheckNodes.push(before);
      }
      if (after) {
        _markCheckNodes.push(after);
      }
      this.eventBus.emit(
        new ContentChangedEvent({
          owner: CORE_OWNER,
          payload: {
            type: 'insert',
            oldRange: this.range,
            newRange: this.range,
            overwrittenNodes: [],
            insertedNodes: [],
            _markCheckNodes,
          },
        })
      );
      return this.range;
    }
  }
}
