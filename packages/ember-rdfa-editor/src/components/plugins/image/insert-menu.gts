import { action } from '@ember/object';
import Component from '@glimmer/component';
import { paintCycleHappened } from '#root/utils/_private/editor-utils.ts';
import { tracked } from 'tracked-built-ins';
import { ImageIcon } from '@appuniversum/ember-appuniversum/components/icons/image';
import type SayController from '#root/core/say-controller.ts';
import ToolbarButton from '#root/components/toolbar/button.gts';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import { uniqueId } from '@ember/helper';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import { not } from 'ember-truth-helpers';

const DEFAULT_SVG_HEIGHT = 100;

type Sig = {
  Args: {
    controller: SayController;
    defaultSvgHeight?: number;
    onActivate?: () => void;
    disabled?: boolean;
  };
};

export default class ImageInsertMenu extends Component<Sig> {
  ImageIcon = ImageIcon;

  @tracked modalOpen = false;
  @tracked url = '';
  @tracked altText = '';
  @tracked showError = false;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get defaultHeight() {
    if (this.url.trim().toLowerCase().endsWith('svg')) {
      return this.args.defaultSvgHeight ?? DEFAULT_SVG_HEIGHT;
    }

    return undefined;
  }

  get isValidUrl(): boolean {
    try {
      const parsedUrl = new URL(this.url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  @action
  onChangeUrl(event: Event & { currentTarget: HTMLInputElement }) {
    this.url = (event.target as HTMLInputElement).value;
  }

  @action
  onChangeAltText(event: Event & { currentTarget: HTMLInputElement }) {
    this.altText = (event.target as HTMLInputElement).value;
  }

  @action
  resetValues() {
    this.url = '';
    this.altText = '';
    this.hideError();
  }

  @action
  hideError() {
    this.showError = false;
  }

  @action
  showModal() {
    this.modalOpen = true;
  }

  @action
  async closeModal() {
    this.modalOpen = false;
    await paintCycleHappened();
    this.controller.focus();
  }

  @action
  async onCancel() {
    this.resetValues();
    await this.closeModal();
  }

  @action
  async onInsert() {
    if (!this.isValidUrl) {
      this.showError = true;
      return;
    }

    const { image } = this.schema.nodes;
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(
        image.create({
          src: this.url,
          alt: this.altText,
          height: this.defaultHeight,
        }),
      );
    });
    this.resetValues();
    await this.closeModal();
    this.args.onActivate?.();
  }
  <template>
    <ToolbarButton
      @disabled={{@disabled}}
      @title={{t "ember-rdfa-editor.image.insert"}}
      @icon={{this.ImageIcon}}
      {{on "click" this.showModal}}
    />
    <AuModal
      @modalOpen={{this.modalOpen}}
      @closeModal={{this.onCancel}}
      class="say-image-insert-modal"
    >
      <:title>{{t "ember-rdfa-editor.image.insert"}}</:title>
      <:body>
        <form class="au-o-flow">
          <AuFormRow>
            {{#let (uniqueId) as |id|}}
              <AuLabel @required={{true}} for={{id}}>
                {{t "ember-rdfa-editor.image.url-label"}}
              </AuLabel>
              <AuInput
                id={{id}}
                @width="block"
                value={{this.url}}
                @error={{this.showError}}
                {{on "change" this.onChangeUrl}}
                {{on "focus" this.hideError}}
              />
              {{#if this.showError}}
                <AuHelpText @error={{true}}>{{t
                    "ember-rdfa-editor.image.url-error"
                  }}</AuHelpText>
              {{/if}}
            {{/let}}
          </AuFormRow>
          <AuFormRow>
            {{#let (uniqueId) as |id|}}
              <AuLabel for={{id}}>
                {{t "ember-rdfa-editor.image.alt-label"}}
              </AuLabel>
              <AuInput
                id={{id}}
                @width="block"
                value={{this.altText}}
                {{on "change" this.onChangeAltText}}
              />
            {{/let}}
          </AuFormRow>
        </form>
        {{#if this.isValidUrl}}
          <img
            src={{this.url}}
            alt={{this.altText}}
            class="say-image-insert-preview"
          />
        {{/if}}
      </:body>
      <:footer>
        <AuButtonGroup>
          <AuButton
            @skin="primary"
            @disabled={{not this.url}}
            {{on "click" this.onInsert}}
          >
            {{t "ember-rdfa-editor.image.insert"}}
          </AuButton>
          <AuButton @skin="secondary" {{on "click" this.onCancel}}>{{t
              "ember-rdfa-editor.utils.back"
            }}</AuButton>
        </AuButtonGroup>
      </:footer>
    </AuModal>
  </template>
}
