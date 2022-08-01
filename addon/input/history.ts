import Controller from '../model/controller';

export function handleUndo(controller: Controller, event: InputEvent) {
  event.preventDefault();
  controller.perform((tr) => {
    tr.commands.undo(undefined);
  });
}
