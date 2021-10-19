import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { KeydownEvent } from "@lblod/ember-rdfa-editor/core/editor-events";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";
 
export default function handleTabInList(event: KeydownEvent, reverse: boolean, controller: EditorController) {
  const selection = controller.selection;
  if(selection.inListState === PropertyState.enabled) {
    const startPositionOffset = selection.getRangeAt(0).start.parentOffset;
    if(startPositionOffset === 0) {
      event.stopPropagation();
      if(reverse) {
        controller.executeCommand('unindent-list');
      } else {
        controller.executeCommand('indent-list');
      }
    }
  }
}
