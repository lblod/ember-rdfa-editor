import { action } from '@ember/object';
import Component from '@glimmer/component';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { chainCommands } from 'prosemirror-commands';
import { indentNode } from '@lblod/ember-rdfa-editor/commands';
import { NodeType } from 'prosemirror-model';

type Args = {
  controller: SayController;
  allowedTypes?: NodeType[] | NodeType;
};

export default class IndentationMenuComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get allowedTypes() {
    if (!this.args.allowedTypes)
      return [this.schema.nodes.paragraph, this.schema.nodes.heading];
    if (this.args.allowedTypes instanceof Array) return this.args.allowedTypes;
    return [this.args.allowedTypes];
  }

  get indentCommand() {
    return chainCommands(
      sinkListItem(this.schema.nodes.list_item),
      indentNode({
        types: this.allowedTypes,
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
        types: this.allowedTypes,
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
