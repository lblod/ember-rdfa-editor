import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
export default function handleTab(reverse: boolean, controller: EditorController) {
  if(reverse) {
    controller.executeCommand('move-to-previous-element');
  } else {
    controller.executeCommand('move-to-next-element');
  }
}
