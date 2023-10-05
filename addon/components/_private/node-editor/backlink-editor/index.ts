import Component from '@glimmer/component';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { goToNodeWithId } from '../utils/go-to-node-with-id';

type Args = {
  controller: SayController;
};

export default class BacklinkEditor extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  goToNodeWithId = (id: string) => goToNodeWithId(id, this.controller);
}
