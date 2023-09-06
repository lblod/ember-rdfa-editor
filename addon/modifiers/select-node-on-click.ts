import { modifier } from 'ember-modifier';
import { NodeSelection } from 'prosemirror-state';
import { SayController } from '..';

/* Set the node selection of the node given by `getPos` when clicking the bound element. */
export default modifier(
  function selectNodeOnClick(
    element: HTMLElement,
    [controller, getPos]: [SayController, () => number | undefined],
  ) {
    const selectOnClick = () => {
      const startPosNode = getPos();
      if (startPosNode === undefined) return;

      const state = controller.mainEditorState;

      const tr = state.tr;
      tr.setSelection(NodeSelection.create(state.doc, startPosNode));
      controller.mainEditorView.dispatch(tr);
    };

    element.addEventListener('click', selectOnClick);

    return () => {
      element.removeEventListener('click', selectOnClick);
    };
  },
  { eager: false },
);
