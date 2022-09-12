import State from '../core/state';
import ModelRange from '../core/model/model-range';
import SelectionReader from '../core/model/readers/selection-reader';
import { SelectionError } from '../utils/errors';

export function eventTargetRange(
  state: State,
  viewRoot: Element,
  event: InputEvent
): ModelRange {
  const selectionReader = new SelectionReader();
  return selectionReader.readDomRange(
    state,
    viewRoot,
    event.getTargetRanges()[0]
  )!;
}

export function deleteTargetRange(state: State, direction: number) {
  let range = state.selection.lastRange;
  if (range) {
    if (range.collapsed) {
      const shifted = range.start.shiftedVisually(direction);
      range =
        direction === -1
          ? new ModelRange(shifted, range.start)
          : new ModelRange(range.start, shifted);
    }
    return range;
  }
  throw new SelectionError();
}
