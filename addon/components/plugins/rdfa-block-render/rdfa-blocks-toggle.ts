import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor/core/say-editor';

type Args = {
  controller?: SayController;
};

export default class RdfaBlocksToggleComponent extends Component<Args> {
  @action
  toggle() {
    this.args.controller?.toggleRdfaBlocks();
  }
}
