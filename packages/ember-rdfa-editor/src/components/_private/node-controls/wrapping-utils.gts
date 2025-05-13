import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  wrapInlineResource,
  wrapLiteral,
  wrapResource,
} from '#root/commands/_private/rdfa-commands/index.ts';
import { wrapInlineLiteral } from '#root/commands/_private/rdfa-commands/wrap-inline-literal.ts';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import type SayController from '#root/core/say-controller.ts';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { not } from 'ember-truth-helpers';
import { modifier } from 'ember-modifier';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import WithUniqueId from '#root/components/_private/utils/with-unique-id.ts';

type WrappingUtilsArgs = {
  controller?: SayController;
};

export default class WrappingUtils extends Component<WrappingUtilsArgs> {
  @tracked modalOpen = false;
  @tracked wrapWithResource;

  constructor(owner: unknown, args: WrappingUtilsArgs) {
    super(owner, args);
    this.wrapWithResource = this.wrapWithBlockResource;
  }

  setUpListeners = modifier(() => {
    const listenerHandler = (event: KeyboardEvent) => {
      if (event.altKey && event.ctrlKey) {
        const key = event.key;
        switch (key) {
          case 'r':
            // Wrap with block resource
            this.openModal(false);
            break;
          case 'R':
            // Wrap with inline resource
            this.openModal(true);
            break;
          case 'l':
            // Wrap with block literal
            this.wrapWithLiteralNode();
            break;
          case 'L':
            // Wrap with inline literal
            this.wrapWithInlineLiteralNode();
            break;
        }
      }
    };
    window.addEventListener('keydown', listenerHandler);
    return () => {
      window.removeEventListener('keydown', listenerHandler);
    };
  });

  openModal = (inline: boolean) => {
    if (inline) {
      this.wrapWithResource = this.wrapWithInlineResource;
    } else {
      this.wrapWithResource = this.wrapWithBlockResource;
    }
    this.modalOpen = true;
  };

  closeModal = () => {
    this.modalOpen = false;
  };

  get controller() {
    return this.args.controller;
  }

  get canWrapWithLiteral() {
    return this.controller?.checkCommand(wrapLiteral());
  }
  get canWrapWithInlineLiteral() {
    return this.controller?.checkCommand(wrapInlineLiteral());
  }
  wrapWithLiteralNode = () => {
    this.controller?.doCommand(wrapLiteral());
  };

  wrapWithBlockResource = (details: Parameters<typeof wrapResource>[0]) => {
    this.controller?.doCommand(wrapResource(details));
    this.closeModal();
  };
  wrapWithInlineLiteralNode = () => {
    this.controller?.doCommand(wrapInlineLiteral());
  };
  wrapWithInlineResource = (details: Parameters<typeof wrapResource>[0]) => {
    this.controller?.doCommand(wrapInlineResource(details));
    this.closeModal();
  };

  <template>
    <AuContent @skin="tiny" {{this.setUpListeners}}>
      <AuToolbar as |Group|>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin="naked"
            {{on "click" (fn this.openModal false)}}
          >
            Wrap With Block Resource
          </AuButton>
        </Group>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin="naked"
            @disabled={{not this.canWrapWithLiteral}}
            {{on "click" this.wrapWithLiteralNode}}
          >
            Wrap With Block Literal
          </AuButton>
        </Group>

        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin="naked"
            {{on "click" (fn this.openModal true)}}
          >
            Wrap With Inline Resource
          </AuButton>
        </Group>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin="naked"
            @disabled={{not this.canWrapWithInlineLiteral}}
            {{on "click" this.wrapWithInlineLiteralNode}}
          >
            Wrap With Inline Literal
          </AuButton>
        </Group>
      </AuToolbar>
    </AuContent>

    <Modal
      @modalOpen={{this.modalOpen}}
      @closeModal={{this.closeModal}}
      @wrapWithResource={{this.wrapWithResource}}
    />
  </template>
}



type ModalArgs = {
  closeModal: () => void;
  modalOpen: boolean;
  wrapWithResource: WrappingUtils['wrapWithResource'];
};

class Modal extends Component<ModalArgs> {
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
