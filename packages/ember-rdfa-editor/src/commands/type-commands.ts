import type { Command } from 'prosemirror-state';

export function addType(pos: number, type: string): Command {
  return function (state, dispatch) {
    if (dispatch) {
      const transaction = state.tr;
      const typeOfValue: string =
        (state.doc.resolve(pos).nodeAfter?.attrs['typeof'] as string) || '';
      transaction.setNodeAttribute(
        pos,
        'typeof',
        typeOfValue.concat(' ', type),
      );
      dispatch(transaction);
    }
    return true;
  };
}

export function removeType(pos: number, type: string): Command {
  return function (state, dispatch) {
    if (dispatch) {
      const transaction = state.tr;
      const oldTypeOf: string =
        (state.doc.resolve(pos).nodeAfter?.attrs['typeof'] as string) || '';
      const typesArray = oldTypeOf.split(' ');
      const newTypeOf = typesArray.filter((t) => t !== type).join(' ');
      transaction.setNodeAttribute(pos, 'typeof', newTypeOf);
      dispatch(transaction);
    }
    return true;
  };
}
