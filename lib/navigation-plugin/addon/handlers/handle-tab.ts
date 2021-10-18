import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
export default function HandleTab(reverse: boolean, controller: EditorController) {
  const selection = controller.selection;
  if(selection.isCollapsed) {
    const element = selection.getRangeAt(0).start.nodeAfter();
    console.log(element.boundNode)
    if(reverse) {
      controller.executeCommand('move-to-previous-element', element);
    } else {
      controller.executeCommand('move-to-next-element', element);
    }
  }
}