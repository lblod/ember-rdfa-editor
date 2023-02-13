import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type Args = {
  controller?: ProseController;
};
export default class LinkMenu extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  @action
  insert() {
    if (this.controller && !this.controller.inEmbeddedView) {
      const { selection, schema } = this.controller.getState();
      this.controller.withTransaction((tr) => {
        const pos = selection.to;
        return tr.insert(pos, schema.nodes.link.create({ href: '' }));
      });
      this.controller.focus();
    }
  }
}
