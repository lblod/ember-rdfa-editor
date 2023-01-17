import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type RdfaIcPluginInsertComponentArgs = {
  controller: ProseController;
};

export default class RdfaIcPluginInsertComponent extends Component<RdfaIcPluginInsertComponentArgs> {
  get controller() {
    return this.args.controller;
  }

  @action
  insertCard() {
    const { schema } = this.controller;
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(schema.node('card')).scrollIntoView();
    });
  }

  @action
  insertCounter() {
    const { schema } = this.controller;
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(schema.node('counter')).scrollIntoView();
    });
  }

  @action
  insertDropdown() {
    const { schema } = this.controller;
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(schema.node('dropdown')).scrollIntoView();
    });
  }
}
