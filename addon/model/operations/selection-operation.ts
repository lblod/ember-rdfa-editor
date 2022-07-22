import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import ModelRange from '../model-range';
import ModelSelection from '../model-selection';
import Operation, { OperationType } from './operation';

export default class SelectionOperation extends Operation {
  public type: OperationType = 'selection-operation';
  private selection: ModelSelection;
  private ranges: ModelRange[];
  constructor(
    eventBus: EventBus | undefined,
    selection: ModelSelection,
    ranges: ModelRange[]
  ) {
    super(eventBus);
    this.selection = selection;
    this.ranges = ranges;
  }
  execute() {
    this.selection.selectRanges(...this.ranges);
    return {};
  }
}
