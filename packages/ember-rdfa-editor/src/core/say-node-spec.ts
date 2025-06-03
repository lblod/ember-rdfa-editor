import type { ComponentLike } from '@glint/template';
import { PNode } from '#root/prosemirror-aliases.ts';
import type { NodeSpec } from 'prosemirror-model';
import type { NodeSerializer } from './say-serializer.ts';
import type { NodeSpecOnChanged } from '#root/plugins/on-changed/plugin.ts';

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
  /**
   * `serialize` method which is used by an instance of a `SaySerializer`.
   * When defined, this method takes precedence over `toDOM` when serializing using a `SaySerializer`.
   *
   * Note: this method is not a replacement to `toDOM`, `toDOM` is still used by Prosemirror to construct the node-view for this node,
   * `serialize` is only used when `SaySerializer` is explicitly used in our code to serialize something.
   * e.g. copying a part of the editor (see `clipboardSerializer`) or extracting the document html using the 'SayController.htmlContent` method.
   *
   */
  serialize?: NodeSerializer;
  attrs?: {
    [name: string]: SayAttributeSpec;
  };
  classNames?: string[] | ((node: PNode) => string[]);
  /**
   * A callback which will be picked up by the on-changed plugin any time a node matching this spec
   * is modified in a transaction. The results of the returned TransactionMonads will be appended to
   * the transaction
   */
  onChanged?: NodeSpecOnChanged;
}

export const isEditable = (node: PNode) => {
  return (node.type.spec as SayNodeSpec).editable;
};
