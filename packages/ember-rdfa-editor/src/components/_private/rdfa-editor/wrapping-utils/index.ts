import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {
  wrapInlineResource,
  wrapLiteral,
  wrapResource,
} from '#root/commands/_private/rdfa-commands/index.ts';
import WrappingModal from './modal.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { wrapInlineLiteral } from '#root/commands/_private/rdfa-commands/wrap-inline-literal.ts';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import type SayController from '#root/core/say-controller.ts';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};

export default class WrappingUtils extends Component<Args> {
  PlusIcon = PlusIcon;

  @tracked modalOpen = false;
  @tracked wrapWithResource;

  Modal = WrappingModal;
  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.wrapWithResource = this.wrapWithBlockResource;
  }

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
}
