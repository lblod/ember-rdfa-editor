import type SayController from '@lblod/ember-rdfa-editor/core/say-controller.ts';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

type Args = {
  controller?: SayController;
  supportedLanguages?: string[];
};
export default class DocumentLanguagePill extends Component<Args> {
  @tracked
  modalOpen = false;

  get controller() {
    return this.args.controller;
  }

  get supportedLanguages() {
    return this.args.supportedLanguages ?? ['nl-BE', 'en-US'];
  }

  get lang() {
    return this.controller?.documentLanguage;
  }

  showModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    this.modalOpen = false;
  };

  setLanguage = (lang: string) => {
    if (this.controller) {
      this.controller.documentLanguage = lang;
    }
  };
}
