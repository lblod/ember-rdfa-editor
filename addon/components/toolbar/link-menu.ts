import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import IntlService from 'ember-intl/services/intl';

type Args = {
  controller?: ProseController;
};
export default class LinkMenu extends Component<Args> {
  @service declare intl: IntlService;
  @tracked href = '';
  @tracked text = '';

  get controller() {
    return this.args.controller;
  }

  @action
  insert() {
    if (this.controller && !this.controller.inEmbeddedView) {
      const { selection, schema } = this.controller.getState();
      this.controller.withTransaction((tr) => {
        const pos = selection.to;
        return tr.insert(
          pos,
          schema.nodes.link.create(
            { href: this.href },
            schema.nodes.placeholder.create({
              placeholderText: this.intl.t(
                'ember-rdfa-editor.link.placeholder.text'
              ),
            })
          )
        );
      });
      this.controller.focus();
    }
  }
}
