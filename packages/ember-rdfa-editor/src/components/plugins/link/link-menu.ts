import { action } from '@ember/object';
import Component from '@glimmer/component';
import { wrapSelection } from '#root/commands/wrap-selection.ts';
import { linkToHref } from '#root/utils/_private/string-utils.ts';
import { LinkIcon } from '@appuniversum/ember-appuniversum/components/icons/link';
import type SayController from '#root/core/say-controller.ts';

type Args = {
  controller: SayController;
  onActivate?: () => void;
};
export default class LinkMenu extends Component<Args> {
  LinkIcon = LinkIcon;

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
      this.args.onActivate?.();
    }
  }
}
