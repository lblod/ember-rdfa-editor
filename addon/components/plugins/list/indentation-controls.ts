import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';

type Args = {
  controller: ProseController;
};

export default class ListIndentationControls extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get canIndent() {
    return this.controller.checkCommand(
      sinkListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  get canUnindent() {
    return this.controller.checkCommand(
      liftListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  @action
  insertIndent() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(
        sinkListItem(this.controller.schema.nodes.list_item),
        true
      );
    }
  }

  @action
  insertUnindent() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(
        liftListItem(this.controller.schema.nodes.list_item),
        true
      );
    }
  }
}
