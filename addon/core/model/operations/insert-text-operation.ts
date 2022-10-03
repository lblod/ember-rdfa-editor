import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { MarkSet } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import Operation from './operation';

export default class InsertTextOperation extends Operation {
  private _text: string;
  private _marks: MarkSet;

  constructor(
    eventbus: EventBus | undefined,
    range: ModelRange,
    text: string,
    marks: MarkSet
  ) {
    super(eventbus, range);
    this._text = text;
    this._marks = marks;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
  }

  get marks(): MarkSet {
    return this._marks;
  }

  set marks(value: MarkSet) {
    this._marks = value;
  }

  execute() {
    let newText = new ModelText(this.text);
    for (const mark of this.marks) {
      newText.addMark(mark.clone());
    }
    const { mapper, overwrittenNodes, _markCheckNodes } =
      OperationAlgorithms.insert(this.range, newText);
    const defaultRange = ModelRange.fromAroundNode(newText);

    const previousSibling = newText.previousSibling;
    if (
      previousSibling &&
      ModelNode.isModelText(previousSibling) &&
      newText.isMergeable(previousSibling)
    ) {
      previousSibling.content = previousSibling.content + newText.content;
      newText.remove();
      newText = previousSibling;
    }
    const nextSibling = newText.nextSibling;
    if (
      nextSibling &&
      ModelNode.isModelText(nextSibling) &&
      newText.isMergeable(nextSibling)
    ) {
      nextSibling.content = newText.content + nextSibling.content;
      newText.remove();
      newText = nextSibling;
    }

    this.emit(
      new ContentChangedEvent({
        owner: CORE_OWNER,
        payload: {
          type: 'insert',
          oldRange: this.range,
          newRange: defaultRange,
          insertedNodes: [newText],
          overwrittenNodes,
          _markCheckNodes,
        },
      })
    );
    return {
      mapper,
      defaultRange,
      insertedNodes: [newText],
      overwrittenNodes,
      markCheckNodes: _markCheckNodes,
    };
  }
}
