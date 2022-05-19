import { View } from '../core/view';
import ModelRange from '../model/model-range';
import SelectionReader from '../model/readers/selection-reader';

export function eventTargetRange(view: View, event: InputEvent): ModelRange {
  const selectionReader = new SelectionReader();
  return selectionReader.readDomRange(view, event.getTargetRanges()[0])!;
}
