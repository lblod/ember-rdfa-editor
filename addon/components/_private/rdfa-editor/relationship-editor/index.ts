import Component from '@glimmer/component';
import {
  IncomingProp,
  OutgoingNodeProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { ResolvedNode } from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import { SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  removeBacklink,
  removeProperty,
  selectNodeByRdfaId,
  selectNodeByResource,
} from '@lblod/ember-rdfa-editor/commands/rdfa-commands';
import { addProperty } from '@lblod/ember-rdfa-editor/commands/rdfa-commands/add-property';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';

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

  goToOutgoing = (outgoing: OutgoingNodeProp) => {
    this.controller?.doCommand(selectNodeByRdfaId({ rdfaId: outgoing.nodeId }));
  };

  goToBacklink = (backlink: IncomingProp) => {
    this.controller?.doCommand(
      selectNodeByResource({ resource: backlink.subject }),
    );
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

  get canAddRelationship() {
    if (isResourceNode(this.args.node.value)) {
      return true;
    } else {
      // Content nodes may only have 1 backlink
      return !this.backlinks || this.backlinks.length === 0;
    }
  }

  addBacklink = (_backlink: IncomingProp) => {
    throw new NotImplementedError();
  };

  addProperty = (property: OutgoingNodeProp) => {
    this.controller?.doCommand(
      addProperty({ position: this.args.node.pos, property }),
    );
  };
}
