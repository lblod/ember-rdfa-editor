import { action } from '@ember/object';
import Component from '@glimmer/component';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller?: SayController;
};

export default class RdfaBlocksToggleComponent extends Component<Args> {
  @action
  toggle() {
    if (this.args.controller) {
      this.args.controller.focus();
    }
    this.args.controller?.toggleRdfaBlocks();
  }
}
