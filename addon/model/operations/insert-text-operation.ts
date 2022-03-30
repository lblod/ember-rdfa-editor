import Operation, {
  OperationResult,
} from '@lblod/ember-rdfa-editor/model/operations/operation';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/model/util/constants';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';

export default class InsertTextOperation extends Operation {
  private _text: string;

  constructor(eventbus: EventBus | undefined, range: ModelRange, text: string) {
    super(eventbus, range);
    this._text = text;
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
  }

  execute(): OperationResult {
    let newText = new ModelText(this.text);
    for (const mark of this.range.getMarks()) {
      newText.addMark(mark.clone());
    }
    const { mapper, overwrittenNodes, _markCheckNodes } =
      OperationAlgorithms.insert(this.range, newText);

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

    const defaultRange = mapper.mapRange(this.range, 'right');
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
    return { mapper, defaultRange };
  }
}
