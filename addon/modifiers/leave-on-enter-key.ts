import { modifier } from 'ember-modifier';
import { SayController, TextSelection } from '..';

export default modifier(function leaveOnEnterKey(
  element: HTMLElement,
  controller: SayController,
  startPosNode: number,
) {
  const state = controller.mainEditorState;
  const node = state.doc.resolve(startPosNode).nodeAfter;
  const leaveOnEnter = (event: KeyboardEvent) => {
    if (event !== 'Enter') return;

    const posAfter = startPosNode + node.nodeSize;
    const tr = state.tr;
    tr.setSelection(TextSelection.create(state.doc, posAfter));
    controller.mainEditorView.dispatch(tr);
    controller.mainEditorView.focus();
  };

  element.addEventListener('keyup', leaveOnEnter);

  return () => {
    element.removeEventListener('keyup', leaveOnEnter);
  };
});
