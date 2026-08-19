import type SayController from '#root/core/say-controller.ts';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { on } from '@ember/modifier';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import PowerSelect from 'ember-power-select/components/power-select';

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
  <template>
    <AuPill
      @skin="link"
      {{on "click" this.showModal}}
      class="au-u-margin-tiny"
      title="Document Language"
    >{{this.lang}}</AuPill>
    {{#if this.modalOpen}}
      <AuModal
        @title="Select document language"
        @closeModal={{this.closeModal}}
        @modalOpen={{true}}
        as |Modal|
      >
        <Modal.Body>
          <PowerSelect
            @placeholder="Select document language"
            @options={{this.supportedLanguages}}
            @selected={{this.lang}}
            @onChange={{this.setLanguage}}
            as |lang|
          >
            {{lang}}
          </PowerSelect>
        </Modal.Body>
      </AuModal>
    {{/if}}
  </template>
}
