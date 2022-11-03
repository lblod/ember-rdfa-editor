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
import { SimpleRangeMapper } from '../range-mapper';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import { SimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';

export interface OperationResult {
  mapper: SimpleRangeMapper;
  defaultRange: ModelRange;
  insertedNodes: ModelNode[];
  overwrittenNodes: ModelNode[];
  markCheckNodes: ModelNode[];
}

export default abstract class Operation {
  private _range: SimpleRange;
  protected root: ModelElement;
  protected eventBus?: EventBus;
  protected logger: Logger;

  protected constructor(
    root: ModelElement,
    eventBus: EventBus | undefined,
    range: SimpleRange
  ) {
    this.eventBus = eventBus;
    this.logger = createLogger(this.constructor.name);
    this._range = range;
    this.root = root;
  }

  get range(): SimpleRange {
    return this._range;
  }

  set range(value: SimpleRange) {
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
