import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  wrapInlineResource,
  wrapLiteral,
  wrapResource,
} from '#root/commands/_private/rdfa-commands/index.ts';
import WrappingModal from './modal.gts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
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

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};

export default class WrappingUtils extends Component<Args> {
  @tracked modalOpen = false;
  @tracked wrapWithResource;

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.wrapWithResource = this.wrapWithBlockResource;
  }

  setUpListeners = modifier(() => {
    const listenerHandler = (event: KeyboardEvent) => {
      if (event.altKey && event.ctrlKey) {
        const key = event.key;
        switch (key) {
          case 'i':
          case 'I':
            this.openModal(true);
            break;
          case 'b':
          case 'B':
            this.openModal(false);
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

  get currentResource() {
    return this.args.node.value.attrs['subject'] as string | undefined;
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

    <WrappingModal
      @modalOpen={{this.modalOpen}}
      @closeModal={{this.closeModal}}
      @wrapWithResource={{this.wrapWithResource}}
    />
  </template>
}
