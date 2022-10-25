import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { MarkSet } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import Operation from './operation';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

export default class InsertTextOperation extends Operation {
  private _text: string;
  private _marks: MarkSet;

  constructor(
    root: ModelElement,
    eventbus: EventBus | undefined,
    range: ModelRange,
    text: string,
    marks: MarkSet
  ) {
    super(root, eventbus, range);
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
      OperationAlgorithms.insert(this.root, this.range, newText);
    const defaultRange = ModelRange.fromAroundNode(this.root, newText);

    const previousSibling = newText.getPreviousSibling(this.root);
    if (
      previousSibling &&
      ModelNode.isModelText(previousSibling) &&
      newText.isMergeable(previousSibling)
    ) {
      previousSibling.content = previousSibling.content + newText.content;
      newText.remove(this.root);
      newText = previousSibling;
    }
    const nextSibling = newText.getNextSibling(this.root);
    if (
      nextSibling &&
      ModelNode.isModelText(nextSibling) &&
      newText.isMergeable(nextSibling)
    ) {
      nextSibling.content = newText.content + nextSibling.content;
      newText.remove(this.root);
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
