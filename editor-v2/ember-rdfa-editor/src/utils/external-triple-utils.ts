import type { FullTriple } from '#root/core/rdfa-processor';
import type { TransactionMonad } from '#root/utils/transaction-utils';
import { EditorState } from 'prosemirror-state';
export function transformExternalTriples(
  transformer: (oldTriples: FullTriple[]) => FullTriple[],
  pos: number = -1,
): TransactionMonad<boolean> {
  return function (state: EditorState) {
    const tr = state.tr;
    if (pos === -1) {
      return {
        transaction: tr.setDocAttribute(
          'externalTriples',
          transformer(state.doc.attrs['externalTriples'] ?? []),
        ),
        initialState: state,
        result: true,
      };
    } else {
      const node = state.doc.nodeAt(pos);
      if (node?.type.spec.attrs?.['externalTriples']) {
        return {
          initialState: state,
          transaction: tr.setNodeAttribute(
            pos,
            'externalTriples',
            transformer(node.attrs['externalTriples'] ?? []),
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
export function setExternalTriples(triples: FullTriple[], pos: number = -1) {
  return transformExternalTriples(() => triples, pos);
}
export function addExternalTriples(triples: FullTriple[], pos: number = -1) {
  return transformExternalTriples(
    (oldTriples) => oldTriples.concat(triples),
    pos,
  );
}
