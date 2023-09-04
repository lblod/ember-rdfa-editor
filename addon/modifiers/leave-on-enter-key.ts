import { modifier } from 'ember-modifier';
import { SayController, TextSelection } from '..';

export default modifier(
  function leaveOnEnterKey(
    element: HTMLElement,
    [controller, startPosNode]: [SayController, number],
  ) {
    const leaveOnEnter = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
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
  },
  { eager: false },
);
