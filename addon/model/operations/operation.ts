import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import EventBus, {
  AnyEventName,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import { EventWithName } from '@lblod/ember-rdfa-editor/utils/editor-event';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default abstract class Operation {
  private _range: ModelRange;
  protected logger: Logger;

  private eventBus?: EventBus;

  protected constructor(eventBus: EventBus | undefined, range: ModelRange) {
    console.log('Created Operation', this.constructor.name);
    this.eventBus = eventBus;
    this._range = range;
    this.logger = createLogger(this.constructor.name);
  }

  get range(): ModelRange {
    return this._range;
  }

  set range(value: ModelRange) {
    this._range = value;
  }

  emit<E extends AnyEventName>(event: EventWithName<E>): void {
    if (this.eventBus) {
      this.eventBus.emit(event);
    } else {
      this.logger(
        'Executing operation without eventbus, expect broken things.'
      );
    }
  }

  canExecute(): boolean {
    return true;
  }

  abstract execute(): ModelRange;
}
