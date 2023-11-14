import Component from '@glimmer/component';
import { AttributeProperty } from '@lblod/ember-rdfa-editor/core/rdfa-annotator';
import { localCopy } from 'tracked-toolbox';

type Args = {
  property?: AttributeProperty;
  onCancel: () => void;
  onSave: (property: AttributeProperty) => void;
};

export default class PropertyEditorModal extends Component<Args> {
  @localCopy('args.property.predicate') newPredicate?: string;
  @localCopy('args.property.object') newObject?: string;

  get isNew() {
    return !this.args.property;
  }

  get title() {
    if (this.isNew) {
      return 'Add property';
    } else {
      return 'Edit property';
    }
  }

  updatePredicate = (event: InputEvent) => {
    this.newPredicate = (event.target as HTMLInputElement).value;
  };

  updateObject = (event: InputEvent) => {
    this.newObject = (event.target as HTMLInputElement).value;
  };

  cancel = () => {
    this.args.onCancel();
  };

  save = () => {
    if (this.newPredicate && this.newObject) {
      this.args.onSave({
        type: 'attribute',
        predicate: this.newPredicate,
        object: this.newObject,
      });
    }
  };

  get canSave() {
    return (
      this.newPredicate &&
      this.newObject &&
      !(
        this.newPredicate === this.args.property?.predicate &&
        this.newObject === this.args.property?.object
      )
    );
  }
}
