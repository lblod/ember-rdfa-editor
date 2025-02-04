import { type Transaction, type EditorState } from 'prosemirror-state';
import { type NodeType, type Attrs, type NodeRange } from 'prosemirror-model';
import { findWrapping } from 'prosemirror-transform';
import { parentNodeSelection } from './_private/node-utils';
import { GapCursor } from '../plugins/gap-cursor';

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

/**
 * Produce a transaction that wraps the selection in a node of the given type with the given
 * attributes. If the selection is unwrappable, try the parent nodes, to wrap e.g. lists.
 * For gap cursors, there is nothing to wrap, but create a node if possible.
 * Adapted from prosemirror-commands wrapIn
 */
export function findHowToWrapIncludingParents(
  { doc, selection, tr }: Pick<EditorState, 'doc' | 'selection' | 'tr'>,
  nodeType: NodeType,
  attrs: Attrs | null = null,
): Transaction | false {
  // Treat gap-cursor selections as a special case, do not wrap around its parent.
  // This ensures that its behaviour is similar as that of normal collapsed text cursors.
  if (selection instanceof GapCursor) {
    const { $from } = selection;
    const contentMatch = $from.parent.contentMatchAt($from.index());
    if (!contentMatch.matchType(nodeType)) {
      return false;
    }
    const node = nodeType.createAndFill(attrs);
    if (!node) {
      return false;
    }
    return tr.replaceRangeWith($from.pos, $from.pos, node);
  }

  const { $from, $to } = selection;
  const range = $from.blockRange($to);
  const wrapping = range && findWrapping(range, nodeType, attrs);
  if (wrapping) {
    return tr.wrap(range, wrapping).scrollIntoView();
  } else {
    const parentSel = parentNodeSelection({ doc, selection });
    return (
      !!parentSel &&
      findHowToWrapIncludingParents(
        { doc, selection: parentSel, tr },
        nodeType,
        attrs,
      )
    );
  }
}
