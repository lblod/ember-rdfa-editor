import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
export default function HandleArrow(reverse: boolean, controller: EditorController) {
  if(reverse) {
    controller.executeCommand('move-cursor-to-the-left');
  } else {
    controller.executeCommand('move-cursor-to-the-right');
  }
}