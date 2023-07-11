import { action } from '@ember/object';
import Component from '@glimmer/component';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller: SayController;
};

/**
 * @deprecated
 */
export default class ListIndentationControls extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get canIndent() {
    return this.controller.checkCommand(
      sinkListItem(this.controller.schema.nodes.list_item),
    );
  }

  get canUnindent() {
    return this.controller.checkCommand(
      liftListItem(this.controller.schema.nodes.list_item),
    );
  }

  @action
  insertIndent() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(
        sinkListItem(this.controller.schema.nodes.list_item),
      );
    }
  }

  @action
  insertUnindent() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(
        liftListItem(this.controller.schema.nodes.list_item),
      );
    }
  }
}
