import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';

type Args = {
  controller?: ProseController;
};

export default class RdfaBlocksToggleComponent extends Component<Args> {
  @action
  toggle() {
    this.args.controller?.toggleRdfaBlocks();
  }
}
