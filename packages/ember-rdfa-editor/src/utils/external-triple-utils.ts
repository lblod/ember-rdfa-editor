import type { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor.ts';
import type { TransactionMonad } from '@lblod/ember-rdfa-editor/utils/transaction-utils.ts';
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
          transformer(
            (state.doc.attrs['externalTriples'] as FullTriple[]) ?? [],
          ),
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
            transformer((node.attrs['externalTriples'] as FullTriple[]) ?? []),
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
