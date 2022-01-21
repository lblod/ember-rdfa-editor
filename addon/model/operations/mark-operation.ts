import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { Mark } from '@lblod/ember-rdfa-editor/model/markSpec';
import { UnconfinedRangeError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelTreeWalker, {
  FilterResult,
} from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';

type MarkAction = 'add' | 'remove';
export default class MarkOperation extends Operation {
  private _mark: Mark;
  private _action: MarkAction;

  constructor(range: ModelRange, mark: Mark, action: MarkAction) {
    super(range);
    this._mark = mark;
    this._action = action;
  }

  get action(): MarkAction {
    return this._action;
  }

  set action(value: MarkAction) {
    this._action = value;
  }

  get mark(): Mark {
    return this._mark;
  }

  set mark(value: Mark) {
    this._mark = value;
  }

  canExecute() {
    return true;
  }

  markAction(node: ModelText, mark: Mark, action: MarkAction) {
    if (action === 'add') {
      node.addMark(mark);
    } else {
      node.removeMark(mark);
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
      this.markAction(node, this.mark, this.action);
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
        this.markAction(node, this.mark, this.action);
      }
    }
    return this.range;
  }
}
