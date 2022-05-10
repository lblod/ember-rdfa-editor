import State from '@lblod/ember-rdfa-editor/core/state';
import { EventWithState } from '@lblod/ember-rdfa-editor/components/ce/input-handler';

export default interface Transaction {
  initialState: State;

  apply(): State;

  needsToWrite: boolean;
}

export function insertText({
  event,
  state,
}: EventWithState<InputEvent>): Transaction {}

export function identity(state: State): Transaction {
  return {
    initialState: state,
    apply(): State {
      return state;
    },
    needsToWrite: false,
  };
}
