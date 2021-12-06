import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { InternalSelection } from '../pernet-raw-editor';

export default interface MovementObserver {
  handleMovement: (
    document: RawEditor,
    oldSelection?: InternalSelection,
    newSelection?: InternalSelection
  ) => void;
}
