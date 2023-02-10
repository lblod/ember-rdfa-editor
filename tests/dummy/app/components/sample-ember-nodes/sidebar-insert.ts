import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { NodeType } from 'prosemirror-model';

type RdfaIcPluginInsertComponentArgs = {
  controller: ProseController;
};

export default class RdfaIcPluginInsertComponent extends Component<RdfaIcPluginInsertComponentArgs> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  insertCard() {
    this.insert(this.schema.nodes.card);
  }

  @action
  insertCounter() {
    this.insert(this.schema.nodes.counter);
  }

  @action
  insertDropdown() {
    this.insert(this.schema.nodes.dropdown);
  }

  insert(type: NodeType) {
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(type.create()).scrollIntoView();
    });
  }
}