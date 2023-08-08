import { action } from '@ember/object';
import Component from '@glimmer/component';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { chainCommands } from 'prosemirror-commands';
import { indentNode } from '@lblod/ember-rdfa-editor/commands';

type Args = {
  controller: SayController;
};

export default class IndentationMenuComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get indentCommand() {
    return chainCommands(
      sinkListItem(this.schema.nodes.list_item),
      indentNode({
        direction: 1,
        predicate: (node, pos, parent) => {
          return parent?.type !== this.schema.nodes.list_item;
        },
      }),
    );
  }

  get unindentCommand() {
    return chainCommands(
      liftListItem(this.controller.schema.nodes.list_item),
      indentNode({
        direction: -1,
        predicate: (node, pos, parent) => {
          return parent?.type !== this.schema.nodes.list_item;
        },
      }),
    );
  }

  get canIndent() {
    return this.controller.checkCommand(this.indentCommand);
  }

  get canUnindent() {
    return this.controller.checkCommand(this.unindentCommand);
  }

  @action
  insertIndent() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(this.indentCommand);
    }
  }

  @action
  insertUnindent() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(this.unindentCommand);
    }
  }
}
