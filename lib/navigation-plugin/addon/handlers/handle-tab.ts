import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
export default function handleTab(reverse: boolean, controller: EditorController) {
  const selection = controller.selection;
  if(reverse) {
    const selectionStart = selection.getRangeAt(0).start
    // Sometimes the nodeAfter nodeBefore function returns null
    const element = selectionStart.nodeBefore() || selectionStart.parent;
    controller.executeCommand('move-to-previous-element', element);
  } else {
    const selectionStart = selection.getRangeAt(0).start;
    // Sometimes the nodeAfter nodeBefore function returns null
    const element = selectionStart.nodeAfter() || selectionStart.parent;
    controller.executeCommand('move-to-next-element', element);
  }
}
