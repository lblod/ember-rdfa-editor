import { EditorState, PNode } from '@lblod/ember-rdfa-editor';
import { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

/**
 * Custom `NodeSpec` interface which extends it with a `serialize` method. This method is called by the custom `SaySerializer`.
 * It allows to create a serialized version of a node based on the node itself and the current editor-state.
 */
export default interface SayNodeSpec extends NodeSpec {
  serialize?: (node: PNode, state: EditorState) => DOMOutputSpec;
}
