import { action } from '@ember/object';
import Component from '@glimmer/component';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import SayController from '#root/core/say-controller.ts';
import { chainCommands } from 'prosemirror-commands';
import { indentNode } from '#root/commands/indent-node.ts';
import { ReverseIndentIcon } from '@appuniversum/ember-appuniversum/components/icons/reverse-indent';
import { IndentIcon } from '@appuniversum/ember-appuniversum/components/icons/indent';
import ToolbarButton from '#root/components/toolbar/button.gts';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { not } from 'ember-truth-helpers';

type Args = {
  controller: SayController;
};

export default class IndentationMenuComponent extends Component<Args> {
  ReverseIndentIcon = ReverseIndentIcon;
  IndentIcon = IndentIcon;

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  get indentCommand() {
    return chainCommands(
      sinkListItem(this.schema.nodes['list_item']),
      indentNode({
        direction: 1,
        predicate: (_node, _pos, parent) => {
          return parent?.type !== this.schema.nodes['list_item'];
        },
      }),
    );
  }

  get unindentCommand() {
    return chainCommands(
      liftListItem(this.controller.schema.nodes['list_item']),
      indentNode({
        direction: -1,
        predicate: (_node, _pos, parent) => {
          return parent?.type !== this.schema.nodes['list_item'];
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
  <template>
    {{#if @controller}}
      <ToolbarButton
        @title={{t "ember-rdfa-editor.unindent"}}
        @icon={{this.ReverseIndentIcon}}
        {{on "click" this.insertUnindent}}
        @disabled={{not this.canUnindent}}
      />
      <ToolbarButton
        @title={{t "ember-rdfa-editor.indent"}}
        @icon={{this.IndentIcon}}
        {{on "click" this.insertIndent}}
        @disabled={{not this.canIndent}}
      />
    {{/if}}
  </template>
}
