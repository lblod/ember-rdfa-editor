import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import AttributeEditor from '../attribute-editor/index.gts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type SayController from '#root/core/say-controller.ts';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { on } from '@ember/modifier';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';

type Args = {
  controller?: SayController;
};

export default class DocumentInfoPill extends Component<Args> {
  AttributeEditor = AttributeEditor;
  @tracked
  modalOpen = false;

  get controller() {
    return this.args.controller;
  }

  showModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    this.modalOpen = false;
  };

  get doc(): ResolvedPNode | undefined {
    if (this.controller) {
      return { pos: -1, value: this.controller.mainEditorState.doc };
    }
    return;
  }
  <template>
    {{#if this.doc}}
      <AuPill
        @skin="link"
        {{on "click" this.showModal}}
        class="au-u-margin-tiny"
      >Document Info</AuPill>
      {{#if this.modalOpen}}
        <AuModal
          @title="Document Info"
          @closeModal={{this.closeModal}}
          @modalOpen={{true}}
          as |Modal|
        >
          {{#if @controller}}
            <Modal.Body>
              <this.AttributeEditor
                @node={{this.doc}}
                @controller={{@controller}}
              />
            </Modal.Body>
          {{/if}}
        </AuModal>
      {{/if}}
    {{/if}}
  </template>
}
