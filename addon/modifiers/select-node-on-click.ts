import { modifier } from 'ember-modifier';
import { NodeSelection } from 'prosemirror-state';

/* Set the node selection of the node given by `getPos` when clicking the bound element. */
export default modifier(
  function selectNodeOnClick(
    element: HTMLElement,
    [controller, getPos]: [SayController, () => number | undefined],
  ) {
    const selectOnClick = () => {
      if (getPos === undefined) return;

      const startPosNode = getPos();
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
