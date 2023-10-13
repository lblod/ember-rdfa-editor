import Component from '@glimmer/component';
import { localCopy } from 'tracked-toolbox';

type Args = {
  isNew: boolean;
  predicate?: string;
  object?: string;
  onCancel: () => void;
  onSave: (predicate: string, object: string) => void;
};

export default class PropertyEditorModal extends Component<Args> {
  @localCopy('args.predicate') newPredicate?: string;
  @localCopy('args.object') newObject?: string;

  get isNew() {
    return this.args.isNew;
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
      this.args.onSave(this.newPredicate, this.newObject);
    }
  };

  get canSave() {
    console.log(this.args.predicate);
    return (
      this.newPredicate &&
      this.newObject &&
      !(
        this.newPredicate === this.args.predicate &&
        this.newObject === this.args.object
      )
    );
  }
}
