import {InternalSelection} from "@lblod/ember-rdfa-editor/editor/raw-editor";
import RawEditor from "@lblod/ember-rdfa-editor/utils/ce/raw-editor";

export default interface MovementObserver {
  handleMovement: (document: RawEditor, oldSelection?: InternalSelection, newSelection?: InternalSelection) => void;
};
