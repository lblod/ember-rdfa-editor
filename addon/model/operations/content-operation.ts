import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import ModelRange from '../model-range';
import RangeMapper from '../range-mapper';
import Operation, { OperationType } from './operation';

export interface ContentOperationResult {
  mapper: RangeMapper;
  defaultRange: ModelRange;
}

export default abstract class ContentOperation extends Operation<ContentOperationResult> {
  private _range: ModelRange;

  public type: OperationType = 'content-operation';
  protected constructor(eventBus: EventBus | undefined, range: ModelRange) {
    super(eventBus);
    this._range = range;
  }

  get range(): ModelRange {
    return this._range;
  }

  set range(value: ModelRange) {
    this._range = value;
  }
}
