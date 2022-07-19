import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import ModelRange from '../model-range';
import ModelSelection from '../model-selection';
import Operation from './operation';

export default class SelectionOperation extends Operation<void> {
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
  execute(): void {
    this.selection.selectRanges(...this.ranges);
  }
}
