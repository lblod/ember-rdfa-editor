import { action } from '@ember/object';
import Component from '@glimmer/component';
import { liftListItem, sinkListItem } from 'prosemirror-schema-list';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const ReverseIndentIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync(
      '@appuniversum/ember-appuniversum/components/icons/reverse-indent',
    ).ReverseIndentIcon
  : 'reverse-indent';
const IndentIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/indent')
      .IndentIcon
  : 'indent';

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
}
