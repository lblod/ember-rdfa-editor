import { action } from '@ember/object';
import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Velcro } from 'ember-velcro';

export default class InlineRdfaComponent extends Component<EmberNodeArgs> {
  Velcro = Velcro;
  get controller() {
    return this.args.controller;
  }
  @action
  onClick() {}

}
