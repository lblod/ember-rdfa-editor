import { action } from '@ember/object';
import Component from '@glimmer/component';
import { wrapSelection } from '@lblod/ember-rdfa-editor/commands/wrap-selection';
import { SayController } from '@lblod/ember-rdfa-editor';
import { linkToHref } from '@lblod/ember-rdfa-editor/utils/_private/string-utils';
import { dependencySatisfies, macroCondition } from '@embroider/macros';
import { importSync } from '@embroider/macros';
const LinkIcon = macroCondition(
  dependencySatisfies('@appuniversum/ember-appuniversum', '>=3.4.1'),
)
  ? // @ts-expect-error TS/glint doesn't seem to treat this as an import
    importSync('@appuniversum/ember-appuniversum/components/icons/link')
      .LinkIcon
  : 'link';

type Args = {
  controller: SayController;
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
    }
  }
}
