import { EditorState } from 'prosemirror-state';
import { DirectEditorProps, EditorView } from 'prosemirror-view';
import { tracked } from '@glimmer/tracking';

export default class SayView extends EditorView {
  @tracked declare state: EditorState;
  @tracked parent?: SayView;

  constructor(
    place:
      | Node
      | ((editor: HTMLElement) => void)
      | {
          mount: HTMLElement;
        }
      | null,
    props: DirectEditorProps,
    parent?: SayView,
  ) {
    super(place, props);
    this.parent = parent;
  }
}
