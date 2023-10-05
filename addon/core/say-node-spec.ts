import { ComponentLike } from '@glint/template';
import { EditorState, PNode } from '@lblod/ember-rdfa-editor';
import { DOMOutputSpec, NodeSpec } from 'prosemirror-model';

export interface SayAttributeSpec {
  default?: unknown;
  editable?: boolean;
  editor?: ComponentLike;
}
/**
 * Custom `NodeSpec` interface which extends it with a `serialize` method. This method is called by the custom `SaySerializer`.
 * It allows to create a serialized version of a node based on the node itself and the current editor-state.
 */
export default interface SayNodeSpec extends NodeSpec {
  editable?: boolean;
  serialize?: (node: PNode, state: EditorState) => DOMOutputSpec;
  attrs?: {
    [name: string]: SayAttributeSpec;
  };
}

export const isEditable = (node: PNode) => {
  return (node.type.spec as SayNodeSpec).editable;
};
