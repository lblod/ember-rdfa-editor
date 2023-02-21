import { EditorState } from 'prosemirror-state';
import { DirectEditorProps, EditorView } from 'prosemirror-view';
import { tracked } from '@glimmer/tracking';

export default class SayView extends EditorView {
  @tracked trackedState: EditorState;

  constructor(
    place:
      | Node
      | ((editor: HTMLElement) => void)
      | {
          mount: HTMLElement;
        }
      | null,
    props: DirectEditorProps
  ) {
    super(place, {
      ...props,
      dispatchTransaction: (tr) => {
        if (props.dispatchTransaction) {
          props.dispatchTransaction(tr);
          this.trackedState = this.state;
        } else {
          const newState = this.state.apply(tr);
          this.trackedState = newState;
          this.updateState(newState);
        }
      },
    });
    this.trackedState = this.state;
  }
}
