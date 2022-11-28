import { action } from '@ember/object';
import Component from '@glimmer/component';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import {
  isOperationStep,
  isSelectionStep,
  Step,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import { tracked } from 'tracked-built-ins';

type Args = {
  controller: ProseController;
};

export default class CodeMarkToolbarButton extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get isCode() {
    return this.controller.isMarkActive(this.controller.schema.marks.code);
  }

  @action
  toggleCode() {
    this.controller.toggleMark('code');
  }
}
