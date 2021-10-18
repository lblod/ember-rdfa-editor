import ModelTable from "@lblod/ember-rdfa-editor/core/model/model-table";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import { PropertyState } from "@lblod/ember-rdfa-editor/util/types";
 
export default function HandleTabInList(controller: EditorController) {
  const selection = controller.selection;
  if(selection.inListState === PropertyState.enabled) {
    controller.executeCommand('insert-newLi');
  }
}
