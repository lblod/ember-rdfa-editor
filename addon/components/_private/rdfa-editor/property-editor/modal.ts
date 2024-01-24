import Component from '@glimmer/component';
import type {
  ContentTriple,
  PlainTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import OutgoingTripleFormComponent from '../outgoing-triple-form';

type Args = {
  property?: PlainTriple | ContentTriple;
  onCancel: () => void;
  onSave: (property: PlainTriple | ContentTriple) => void;
};

export default class PropertyEditorModal extends Component<Args> {
  OutgoingTripleForm = OutgoingTripleFormComponent;

  cancel = () => {
    this.args.onCancel();
  };

  save = (triple: PlainTriple) => {
    this.args.onSave(triple);
  };
}
