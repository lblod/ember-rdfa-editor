import { action } from '@ember/object';
import Component from '@glimmer/component';
import SayController from '#root/core/say-controller.ts';

type Args = {
  controller?: SayController;
};

export default class RdfaBlocksToggleComponent extends Component<Args> {
  get isShowingRdfaBlocks() {
    return this.args.controller?.showRdfaBlocks;
  }
  @action
  toggle() {
    if (this.args.controller) {
      this.args.controller.focus();
    }
    this.args.controller?.toggleRdfaBlocks();
  }
}
