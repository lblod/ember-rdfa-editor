import Controller from '../model/controller';
import ModelRange from '../model/model-range';
import { eventTargetRange } from './utils';

export function handleDelete(
  controller: Controller,
  event: InputEvent,
  direction: number
): void {
  event.preventDefault();
  const tr = controller.createTransaction();
  let range = eventTargetRange(tr.workingCopy, controller.view.domRoot, event);
  if (range.collapsed) {
    const shifted = range.start.shiftedVisually(direction);
    range =
      direction === -1
        ? new ModelRange(shifted, range.start)
        : new ModelRange(range.start, shifted);
  }
  tr.commands.remove({ range });
  controller.dispatchTransaction(tr);
}
