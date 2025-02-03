import { type EditorState } from 'prosemirror-state';
import { NodeType, type Attrs, type NodeRange } from 'prosemirror-model';
import { findWrapping } from 'prosemirror-transform';
import { parentNodeSelection } from './_private/node-utils';

export function findWrappingIncludingParents(
  { doc, selection }: Pick<EditorState, 'doc' | 'selection'>,
  nodeType: NodeType,
  attrs: Attrs | null = null,
): [NodeRange, ReturnType<typeof findWrapping>] | null {
  const { $from, $to } = selection;
  const range = $from.blockRange($to);
  const wrapping = range && findWrapping(range, nodeType, attrs);
  if (wrapping) {
    return [range, wrapping];
  } else {
    const parentSel = parentNodeSelection({ doc, selection });
    return (
      parentSel &&
      findWrappingIncludingParents(
        { doc, selection: parentSel },
        nodeType,
        attrs,
      )
    );
  }
}
