import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

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
