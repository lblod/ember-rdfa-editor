import { action } from '@ember/object';
import Component from '@glimmer/component';
import { wrapSelection } from '@lblod/ember-rdfa-editor/commands/wrap-selection';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type Args = {
  controller: ProseController;
};
export default class LinkMenu extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get canInsert() {
    return (
      !this.controller.inEmbeddedView &&
      this.controller.checkCommand(wrapSelection(this.schema.nodes.link))
    );
  }

  @action
  insert() {
    if (!this.controller.inEmbeddedView) {
      this.controller.doCommand(wrapSelection(this.schema.nodes.link));
      this.controller.focus();
    }
  }
}
