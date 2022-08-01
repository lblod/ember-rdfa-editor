import Controller from '../model/controller';
import { deleteTargetRange, eventTargetRange } from './utils';

export function handleDelete(
  controller: Controller,
  event: InputEvent,
  direction: number
): void {
  event.preventDefault();
  const tr = controller.createTransaction();
  const range = deleteTargetRange(tr.workingCopy, direction);
  tr.commands.remove({ range });
  controller.dispatchTransaction(tr);
  // let range = eventTargetRange(tr.workingCopy, controller.view.domRoot, event);
}
