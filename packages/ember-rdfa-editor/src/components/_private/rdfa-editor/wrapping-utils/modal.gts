import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import type RdfaWrappingUtils from './index.ts';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import { not } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import { modifier } from 'ember-modifier';
import WithUniqueId from '#root/components/_private/utils/with-unique-id.ts';

type Args = {
  closeModal: () => void;
  modalOpen: boolean;
  wrapWithResource: RdfaWrappingUtils['wrapWithResource'];
};

export default class WrappingUtilsModal extends Component<Args> {
  @tracked initiallyFocusedElement?: HTMLElement;

  setupFormSubmitShortcut = modifier((formElement: HTMLFormElement) => {
    const ctrlEnterHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        formElement.requestSubmit();
      }
    };
    window.addEventListener('keydown', ctrlEnterHandler);
    return () => window.removeEventListener('keydown', ctrlEnterHandler);
  });

  initialFocus = modifier((element: HTMLElement) => {
    this.initiallyFocusedElement = element;
  });

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

  <template>
    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{@modalOpen}}
        @closable={{true}}
        @closeModal={{@closeModal}}
        {{! @glint-expect-error appuniversum types should be adapted to accept an html element here }}
        @initialFocus={{this.initiallyFocusedElement}}
      >
        <:title>Wrap selection</:title>
        <:body>
          <form
            class="au-c-form"
            id={{formId}}
            {{on "submit" this.save}}
            {{this.setupFormSubmitShortcut}}
          >
            <AuFormRow>
              <WithUniqueId as |id|>
                <AuLabel
                  for={{id}}
                  @required={{true}}
                  @requiredLabel="Required"
                >
                  Generate new URI?
                </AuLabel>
                <AuRadioGroup
                  id={{id}}
                  required={{true}}
                  @name="isNew"
                  @selected={{this.generateNewUri}}
                  @onChange={{this.shouldGenerateNewUri}}
                  @alignment="inline"
                  as |Group|
                >
                  <Group.Radio @value="yes">Yes</Group.Radio>
                  <Group.Radio @value="no">No</Group.Radio>
                </AuRadioGroup>
              </WithUniqueId>
            </AuFormRow>
            <AuFormRow>
              <WithUniqueId as |id|>
                <AuLabel
                  for={{id}}
                  @required={{true}}
                  @requiredLabel="Required"
                >
                  {{#if this.isNewUri}}URI base{{else}}Existing URI{{/if}}
                </AuLabel>
                <AuInput
                  {{this.initialFocus}}
                  id={{id}}
                  required={{true}}
                  value={{this.resourceUriBase}}
                  @width="block"
                  placeholder="http://example.com/resource/"
                  {{on "input" this.updateUriBase}}
                />
              </WithUniqueId>
            </AuFormRow>
          </form>
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton
              form={{formId}}
              type="submit"
              @disabled={{not this.canSave}}
            >
              Save
            </AuButton>
            <AuButton
              @skin="secondary"
              {{on "click" @closeModal}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    </WithUniqueId>
  </template>
}
