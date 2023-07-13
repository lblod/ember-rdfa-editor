import { DOMOutputSpec, Mark, MarkSpec } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

/**
 * Custom `MarkSpec` interface which extends it with a `serialize` method. This method is called by the custom `SaySerializer`.
 * It allows to create a serialized version of a mark based on the mark itself and the current editor-state.
 */
export default interface SayMarkSpec extends MarkSpec {
  /**
   * `serialize` method which is used by an instance of a `SaySerializer`.
   * When defined, this method takes precedence over `toDOM` when serializing using a `SaySerializer`.
   *
   * Note: this method is not a replacement to `toDOM`, `toDOM` is still used to construct the a node-view for this node,
   * this method is only used when the `SaySerializer` is explicitely used (e.g. when copying a part of the editor or when extracting the document html using the 'SayController.htmlContent` method).
   *
   */
  serialize?: (
    mark: Mark,
    inline: boolean,
    state: EditorState
  ) => DOMOutputSpec;
}
