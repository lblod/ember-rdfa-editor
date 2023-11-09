import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import {
  wrapLiteral,
  wrapResource,
} from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands';
import WrappingModal from './modal';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};

export default class RdfaRelationshipEditor extends Component<Args> {
  @tracked modalOpen = false;

  Modal = WrappingModal;

  openModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    this.modalOpen = false;
  };

  get controller() {
    return this.args.controller;
  }

  get currentResource() {
    return this.args.node.value.attrs.resource as string | undefined;
  }

  get canWrapWithLiteral() {
    return this.controller?.checkCommand(wrapLiteral());
  }
  wrapWithLiteralNode = () => {
    this.controller?.doCommand(wrapLiteral());
  };

  wrapWithResource = (details: { uriBase: string }) => {
    this.controller?.doCommand(wrapResource(details));
    this.closeModal();
  };
}
