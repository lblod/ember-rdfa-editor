import { DOMOutputSpec, Mark, MarkSpec } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

/**
 * Custom `MarkSpec` interface which extends it with a `serialize` method. This method is called by the custom `SaySerializer`.
 * It allows to create a serialized version of a mark based on the mark itself and the current editor-state.
 */
export default interface SayMarkSpec extends MarkSpec {
  serialize?: (
    mark: Mark,
    inline: boolean,
    state: EditorState
  ) => DOMOutputSpec;
}
