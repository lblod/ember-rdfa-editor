import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';

export default abstract class Operation {
  private _range: ModelRange;
  protected eventBus: EventBus;

  protected constructor(eventBus: EventBus, range: ModelRange) {
    this.eventBus = eventBus;
    this._range = range;
  }

  get range(): ModelRange {
    return this._range;
  }

  set range(value: ModelRange) {
    this._range = value;
  }

  canExecute(): boolean {
    return true;
  }

  abstract execute(): ModelRange;
}
