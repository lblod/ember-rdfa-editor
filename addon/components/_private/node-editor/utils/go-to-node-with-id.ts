import { NodeSelection, SayController } from '@lblod/ember-rdfa-editor';

export const goToNodeWithId = (id: string, controller: SayController) => {
  const doc = controller.mainEditorState.doc;
  if (!doc) {
    return;
  }
  let found = false;
  let resultPos = 0;
  doc.descendants((node, pos) => {
    if (found) return false;
    if (node.attrs.__rdfaId === id) {
      found = true;
      resultPos = pos;
      return false;
    }
    return true;
  });
  if (found) {
    controller.withTransaction((tr) => {
      return tr
        .setSelection(new NodeSelection(tr.doc.resolve(resultPos)))
        .scrollIntoView();
    });
  }
};
