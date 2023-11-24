import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RdfaWrappingUtils from './index';

type Args = {
  openModal: () => void;
  closeModal: () => void;
  wrapWithResource: RdfaWrappingUtils['wrapWithResource'];
};

export default class RelationshipEditorModal extends Component<Args> {
  @tracked generateNewUri = 'yes';
  @tracked resourceUriBase = '';

  updateUriBase = (event: InputEvent) => {
    this.resourceUriBase = (event.target as HTMLInputElement).value;
  };
  shouldGenerateNewUri = (value: 'yes' | 'no') => {
    this.generateNewUri = value;
  };

  save = (event: Event) => {
    event.preventDefault();
    if (this.isNewUri) {
      this.args.wrapWithResource({ uriBase: this.resourceUriBase });
    } else {
      this.args.wrapWithResource({ existingUri: this.resourceUriBase });
    }
  };

  get canSave() {
    return !!this.resourceUriBase;
  }
  get isNewUri() {
    return this.generateNewUri === 'yes';
  }
}
