import type { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import type { TransactionMonad } from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { EditorState } from 'prosemirror-state';
export function transformMetaTriples(
  transformer: (oldTriples: FullTriple[]) => FullTriple[],
  pos: number = -1,
): TransactionMonad<boolean> {
  return function (state: EditorState) {
    const tr = state.tr;
    if (pos === -1) {
      return {
        transaction: tr.setDocAttribute(
          'metaTriples',
          transformer(state.doc.attrs['metaTriples'] ?? []),
        ),
        initialState: state,
        result: true,
      };
    } else {
      const node = state.doc.nodeAt(pos);
      if (node?.type.spec.attrs?.['metaTriples']) {
        return {
          initialState: state,
          transaction: tr.setNodeAttribute(
            pos,
            'metaTriples',
            transformer(node.attrs['metaTriples'] ?? []),
          ),
          result: true,
        };
      } else {
        return {
          initialState: state,
          transaction: tr,
          result: false,
        };
      }
    }
  };
}
export function setMetaTriples(triples: FullTriple[], pos: number = -1) {
  return transformMetaTriples(() => triples, pos);
}
export function addMetaTriples(triples: FullTriple[], pos: number = -1) {
  return transformMetaTriples((oldTriples) => oldTriples.concat(triples), pos);
}
