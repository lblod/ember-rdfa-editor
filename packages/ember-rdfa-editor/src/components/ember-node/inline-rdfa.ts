import { action } from '@ember/object';
import Component from '@glimmer/component';
import SayView from '#root/core/say-view.ts';
import type { EmberNodeArgs } from '#root/utils/ember-node.ts';
import { tracked } from '@glimmer/tracking';
import { editableNodePlugin } from '#root/plugins/_private/editable-node/index.ts';

export default class InlineRdfaComponent extends Component<EmberNodeArgs> {
  @tracked innerView?: SayView;

  get plugins() {
    return [editableNodePlugin(this.args.getPos)];
  }
  get controller() {
    return this.args.controller;
  }

  @action
  initEditor(view: SayView) {
    this.innerView = view;
  }
}
