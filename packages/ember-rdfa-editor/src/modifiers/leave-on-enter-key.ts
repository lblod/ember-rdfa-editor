import type SayController from '@lblod/ember-rdfa-editor/core/say-controller.ts';
import { modifier } from 'ember-modifier';
import { TextSelection } from 'prosemirror-state';

/* Set the cursor behind the node after `startPosNode` when pressing enter in the bound element. */
export default modifier(function leaveOnEnterKey(
  element: HTMLElement,
  [controller, getPos]: [SayController, () => number | undefined],
) {
  const leaveOnEnter = (event: KeyboardEvent) => {
    const startPosNode = getPos();
    const modifierKeyPressed =
      event.shiftKey || event.ctrlKey || event.metaKey || event.altKey;
    if (
      modifierKeyPressed ||
      event.key !== 'Enter' ||
      startPosNode === undefined
    )
      return;

    const state = controller.mainEditorState;
    const node = state.doc.resolve(startPosNode).nodeAfter;
    if (!node) return;
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
