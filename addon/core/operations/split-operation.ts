import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import OperationAlgorithms from "@lblod/ember-rdfa-editor/model/operations/operation-algorithms";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {ModelError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class SplitOperation extends Operation {
  private _splitParent: boolean;

  constructor(range: ModelRange, splitParent = true) {
    super(range);
    this._splitParent = splitParent;
  }

  get splitParent(): boolean {
    return this._splitParent;
  }

  set splitParent(value: boolean) {
    this._splitParent = value;
  }

  execute(): ModelRange {
    if (this.range.collapsed) {
      const newPos = this.doSplit(this.range.start);
      return new ModelRange(newPos, newPos);
    } else {
      // this is very fragile and depends heavily on execution order.
      // be careful making changes here
      const end = this.doSplit(this.range.end);
      const afterEnd = end.nodeAfter();
      if(!afterEnd) {
        throw new ModelError("Unexpected model state");
      }
      const start = this.doSplit(this.range.start);
      return new ModelRange(start, ModelPosition.fromBeforeNode(afterEnd));
    }
  }

  private doSplit(position: ModelPosition) {
    if (this._splitParent) {
      return OperationAlgorithms.split(position);
    } else {
      return OperationAlgorithms.splitText(position);
    }
  }

}
