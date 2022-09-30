import { EventWithName } from '@lblod/ember-rdfa-editor/utils/editor-event';
import EventBus, {
  AnyEventName,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelRange from '../model-range';
import ModelNode from '../nodes/model-node';
import RangeMapper from '../range-mapper';

export interface OperationResult {
  mapper: RangeMapper;
  defaultRange: ModelRange;
  insertedNodes: ModelNode[];
  overwrittenNodes: ModelNode[];
  markCheckNodes: ModelNode[];
}

export default abstract class Operation {
  private _range: ModelRange;
  protected eventBus?: EventBus;
  protected logger: Logger;

  protected constructor(eventBus: EventBus | undefined, range: ModelRange) {
    this.eventBus = eventBus;
    this.logger = createLogger(this.constructor.name);
    this._range = range;
  }

  get range(): ModelRange {
    return this._range;
  }

  set range(value: ModelRange) {
    this._range = value;
  }

  abstract execute(): OperationResult;

  emit<E extends AnyEventName>(event: EventWithName<E>): void {
    if (this.eventBus) {
      this.eventBus.emit(event);
    } else {
      this.logger(
        'Executing operation without eventbus, expect broken things.'
      );
    }
  }
}
