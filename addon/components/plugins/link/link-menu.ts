import { action } from '@ember/object';
import Component from '@glimmer/component';
import { wrapSelection } from '@lblod/ember-rdfa-editor/commands/wrap-selection';
import { SayController } from '@lblod/ember-rdfa-editor';
import { linkToHref } from '@lblod/ember-rdfa-editor/utils/_private/string-utils';

type Args = {
  controller: SayController;
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
      this.controller.checkCommand(wrapSelection(this.schema.nodes['link']))
    );
  }

  @action
  insert() {
    if (!this.controller.inEmbeddedView) {
      this.controller.doCommand(
        wrapSelection(this.schema.nodes['link'], (nodeRange) => {
          if (nodeRange) {
            const text = nodeRange.$from.doc.textBetween(
              nodeRange.$from.pos,
              nodeRange.$to.pos,
            );
            const href = linkToHref(text);
            return { href };
          } else {
            return null;
          }
        }),
      );
      this.controller.focus();
    }
  }
}
