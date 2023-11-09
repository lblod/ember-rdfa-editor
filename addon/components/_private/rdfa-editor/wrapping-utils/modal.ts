import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RdfaWrappingUtils from './index';

type Args = {
  openModal: () => void;
  closeModal: () => void;
  wrapWithResource: RdfaWrappingUtils['wrapWithResource'];
};

export default class RelationshipEditorModal extends Component<Args> {
  @tracked resourceUriBase = '';

  updateUriBase = (event: InputEvent) => {
    this.resourceUriBase = (event.target as HTMLInputElement).value;
  };

  save = (event: Event) => {
    event.preventDefault();
    this.args.wrapWithResource({ uriBase: this.resourceUriBase });
  };

  get canSave() {
    return !!this.resourceUriBase;
  }
}
