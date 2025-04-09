import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';

import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type SayController from '#root/core/say-controller.ts';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { not } from 'ember-truth-helpers';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';

type Args = {
  node: ResolvedPNode;
  controller: SayController;
};

export default class RemoveNode extends Component<Args> {
  AlertTriangleIcon = AlertTriangleIcon;

  @tracked showDialog = false;

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  showConfirmationDialog = () => {
    this.showDialog = true;
  };

  closeConfirmationDialog = () => {
    this.showDialog = false;
  };

  confirmDelete = () => {
    this.deleteNode();
    this.closeConfirmationDialog();
  };

  deleteNode = () => {
    this.controller.withTransaction((tr) => {
      return tr.deleteRange(
        this.node.pos,
        this.node.pos + this.node.value.nodeSize,
      );
    });
  };

  get enabled() {
    return this.args.node.pos !== -1;
  }

  <template>
    <AuButton
      @width="block"
      @alert={{true}}
      {{on "click" this.showConfirmationDialog}}
      @disabled={{not this.enabled}}
    >
      Remove node
    </AuButton>
    <AuModal
      @title="Delete RDFA Node"
      @modalOpen={{this.showDialog}}
      @closeModal={{this.closeConfirmationDialog}}
      as |Modal|
    >
      <Modal.Body>
        <AuAlert
          @title="Delete RDFA node"
          @skin="warning"
          @icon={{this.AlertTriangleIcon}}
        >
          Are you sure you want to delete this RDFA node?
        </AuAlert>
      </Modal.Body>

      <Modal.Footer>
        <AuButtonGroup>
          <AuButton {{on "click" this.confirmDelete}} @skin="primary">
            Yes
          </AuButton>
          <AuButton
            {{on "click" this.closeConfirmationDialog}}
            @skin="secondary"
          >
            No
          </AuButton>
        </AuButtonGroup>
      </Modal.Footer>
    </AuModal>
  </template>
}
