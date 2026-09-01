import { action } from '@ember/object';
import Component from '@glimmer/component';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import SayController from '#root/core/say-controller.ts';
import { ReverseIndentIcon } from '@appuniversum/ember-appuniversum/components/icons/reverse-indent';
import { IndentIcon } from '@appuniversum/ember-appuniversum/components/icons/indent';
import ToolbarButton from '#root/components/toolbar/button.gts';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { not } from 'ember-truth-helpers';

type Args = {
  controller: SayController;
};

/**
 * @deprecated
 */
export default class ListIndentationControls extends Component<Args> {
  ReverseIndentIcon = ReverseIndentIcon;
  IndentIcon = IndentIcon;

  get controller() {
    return this.args.controller;
  }

  get canIndent() {
    return this.controller.checkCommand(
      sinkListItem(this.controller.schema.nodes['list_item']),
    );
  }

  get canUnindent() {
    return this.controller.checkCommand(
      liftListItem(this.controller.schema.nodes['list_item']),
    );
  }

  @action
  insertIndent() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(
        sinkListItem(this.controller.schema.nodes['list_item']),
      );
    }
  }

  @action
  insertUnindent() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(
        liftListItem(this.controller.schema.nodes['list_item']),
      );
    }
  }
  <template>
    {{#if @controller}}
      <ToolbarButton
        @title={{t "ember-rdfa-editor.unindent-list"}}
        @icon={{this.ReverseIndentIcon}}
        {{on "click" this.insertUnindent}}
        @disabled={{not this.canUnindent}}
      />
      <ToolbarButton
        @title={{t "ember-rdfa-editor.indent-list"}}
        @icon={{this.IndentIcon}}
        {{on "click" this.insertIndent}}
        @disabled={{not this.canUnindent}}
      />
    {{/if}}
  </template>
}
