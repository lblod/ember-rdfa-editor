import EventBus, {
  AnyEventName,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import { EventWithName } from '@lblod/ember-rdfa-editor/utils/editor-event';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default abstract class Operation<
  R extends object = Record<string, never>
> {
  protected logger: Logger;

  private eventBus?: EventBus;

  protected constructor(eventBus: EventBus | undefined) {
    this.eventBus = eventBus;
    this.logger = createLogger(this.constructor.name);
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

  abstract execute(): R;
}
