import Controller from '../core/controllers/controller';

type FontStyle = 'bold' | 'italic' | 'underline' | 'strikethrough';

export function handleBasicStyle(style: FontStyle) {
  return function (controller: Controller, event: KeyboardEvent) {
    event.preventDefault();
    controller.perform((tr) => {
      const selection = tr.currentSelection;
      if (selection.hasMark(style)) {
        tr.commands.removeMarkFromSelection({ markName: style });
      } else {
        tr.commands.addMarkToSelection({ markName: style });
      }
    });
  };
}
