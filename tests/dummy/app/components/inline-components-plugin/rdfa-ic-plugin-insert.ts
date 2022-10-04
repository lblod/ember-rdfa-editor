import { action } from '@ember/object';
import Component from '@glimmer/component';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';

type RdfaIcPluginInsertComponentArgs = {
  controller: Controller;
};

export default class RdfaIcPluginInsertComponent extends Component<RdfaIcPluginInsertComponentArgs> {
  @action
  insertCounter() {
    this.args.controller.perform((transaction) => {
      transaction.commands.insertComponent({
        componentName: 'inline-components-plugin/counter',
      });
    });
  }

  @action
  insertDropdown() {
    this.args.controller.perform((transaction) => {
      transaction.commands.insertComponent({
        componentName: 'inline-components-plugin/dropdown',
      });
    });
  }
}
