import Component from '@glimmer/component';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { goToNodeWithId } from '../utils/go-to-node-with-id';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import { IncomingProp } from '@lblod/ember-rdfa-editor/core/say-parser';

type Args = {
  controller: SayController;
  node: ResolvedNode;
};

export default class BacklinkEditor extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get backlinks() {
    return this.args.node.value.attrs.backlinks as Record<string, IncomingProp>;
  }

  goToNodeWithId = (id: string) => {
    goToNodeWithId(id, this.controller);
  };
}
