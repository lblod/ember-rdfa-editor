import Component from '@glimmer/component';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import { SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  removeBacklink,
  removeProperty,
  selectNodeByRdfaId,
} from '@lblod/ember-rdfa-editor/commands/rdfa-commands';

type Args = {
  controller?: SayController;
  node: ResolvedNode;
};

export default class RdfaRelationshipEditor extends Component<Args> {
  get backlinks() {
    return this.args.node.value.attrs.backlinks as IncomingProp[] | undefined;
  }

  get properties() {
    return this.args.node.value.attrs.properties as OutgoingProp[] | undefined;
  }

  get hasOutgoing() {
    return this.properties?.some((prop) => prop.type === 'node');
  }

  get controller() {
    return this.args.controller;
  }

  get showOutgoingSection() {
    return isResourceNode(this.args.node.value);
  }

  goToNodeWithId = (id: string) => {
    this.controller?.doCommand(selectNodeByRdfaId({ rdfaId: id }));
  };

  removeBacklink = (index: number) => {
    console.log('remove backlink');
    this.controller?.doCommand(
      removeBacklink({ position: this.args.node.pos, index }),
    );
  };

  removeProperty = (index: number) => {
    this.controller?.doCommand(
      removeProperty({ position: this.args.node.pos, index }),
    );
  };
}
