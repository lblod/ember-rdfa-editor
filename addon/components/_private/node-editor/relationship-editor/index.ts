import Component from '@glimmer/component';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { goToNodeWithId } from '../utils/go-to-node-with-id';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';

type Args = {
  controller: SayController;
  node: ResolvedNode;
};

export default class RelationshipEditor extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get outgoing() {
    const properties = this.args.node.value.attrs.properties as
      | Record<string, OutgoingProp>
      | undefined;
    if (properties) {
      const filteredEntries = Object.entries(properties).filter(
        ([_, prop]) => prop.type === 'node',
      );
      return Object.fromEntries(filteredEntries);
    } else {
      return;
    }
  }

  get backlinks() {
    return this.args.node.value.attrs.backlinks as
      | Record<string, IncomingProp>
      | undefined;
  }

  goToNodeWithId = (id: string) => goToNodeWithId(id, this.controller);
}
