import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type Args = {
  controller: ProseController;
};
export default class SuperscriptButton extends Component<Args> {
  get controller() {
    return this.args.controller;
  }
  get isActive() {
    return this.controller.isMarkActive(
      this.controller.schema.marks.superscript,
      true
    );
  }

  @action
  toggle() {
    this.controller.toggleMark(this.controller.schema.marks.superscript, true);
  }
}
