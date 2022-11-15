import { action } from '@ember/object';
import Component from '@glimmer/component';
import Controller from '@lblod/ember-rdfa-editor/model/controller';

type RdfaIcPluginInsertComponentArgs = {
  controller: Controller;
};

export default class RdfaIcPluginInsertComponent extends Component<RdfaIcPluginInsertComponentArgs> {
  @action
  insertCounter() {
    this.args.controller.executeCommand(
      'insert-component',
      'inline-components-plugin/counter'
    );
  }

  @action
  insertDropdown() {
    this.args.controller.executeCommand(
      'insert-component',
      'inline-components-plugin/dropdown'
    );
  }
}
