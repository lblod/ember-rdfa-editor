import State from '../core/state';
import ModelRange from '../model/model-range';
import SelectionReader from '../model/readers/selection-reader';

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
