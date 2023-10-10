import Component from '@glimmer/component';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';
import { goToNodeWithId } from '../utils/go-to-node-with-id';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { tracked } from '@glimmer/tracking';

type Args = {
  controller: SayController;
  node: ResolvedNode;
};

export default class RelationshipEditor extends Component<Args> {
  @tracked collapsed = false;
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
      if (filteredEntries.length) {
        return Object.fromEntries(filteredEntries);
      } else {
        return;
      }
    } else {
      return;
    }
  }

  get backlinks() {
    const backlinks = this.args.node.value.attrs.backlinks as
      | Record<string, IncomingProp>
      | undefined;
    if (backlinks && Object.keys(backlinks).length) {
      return backlinks;
    } else {
      return;
    }
  }

  toggleSection = () => {
    this.collapsed = !this.collapsed;
  };

  goToNodeWithId = (id: string) => goToNodeWithId(id, this.controller);
}
