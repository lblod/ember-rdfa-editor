import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  removeBacklink,
  removeProperty,
  selectNodeByRdfaId,
  selectNodeByResource,
} from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands';
import { addProperty } from '@lblod/ember-rdfa-editor/commands';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';
import RelationshipEditorModal from './modal';
import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  Backlink,
  ExternalProperty,
  ExternalPropertyObject,
  Property,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};

export default class RdfaRelationshipEditor extends Component<Args> {
  @tracked modalOpen = false;

  Modal = RelationshipEditorModal;

  get backlinks() {
    return this.args.node.value.attrs.backlinks as Backlink[] | undefined;
  }

  get properties() {
    return this.args.node.value.attrs.properties as Property[] | undefined;
  }

  get hasOutgoing() {
    return this.properties?.some((prop) => prop.type === 'external');
  }

  get controller() {
    return this.args.controller;
  }

  get showOutgoingSection() {
    return isResourceNode(this.args.node.value);
  }

  get currentResource() {
    return this.args.node.value.attrs.resource as string | undefined;
  }

  get currentRdfaId() {
    return this.args.node.value.attrs.__rdfaId as string;
  }

  goToOutgoing = (outgoing: ExternalProperty) => {
    const { object } = outgoing;
    if (object.type === 'literal') {
      this.controller?.doCommand(selectNodeByRdfaId({ rdfaId: object.rdfaId }));
    } else {
      this.controller?.doCommand(
        selectNodeByResource({ resource: object.resource }),
      );
    }
  };

  goToBacklink = (backlink: Backlink) => {
    this.controller?.doCommand(
      selectNodeByResource({ resource: backlink.subject }),
    );
  };

  removeBacklink = (index: number) => {
    let target: ExternalPropertyObject;
    if (this.currentResource) {
      target = {
        type: 'resource',
        resource: this.currentResource,
      };
    } else {
      target = {
        type: 'literal',
        rdfaId: this.currentRdfaId,
      };
    }
    this.controller?.doCommand(removeBacklink({ target, index }));
  };

  removeProperty = (index: number) => {
    // This function can only be called when the selected node defines a resource
    if (this.currentResource) {
      this.controller?.doCommand(
        removeProperty({ resource: this.currentResource, index }),
      );
    }
  };

  get canAddRelationship() {
    if (isResourceNode(this.args.node.value)) {
      return true;
    } else {
      // Content nodes may only have 1 backlink
      return !this.backlinks || this.backlinks.length === 0;
    }
  }

  addRelationship = () => {
    this.modalOpen = true;
  };

  saveNewRelationship = (details: {
    predicate: string;
    object: ExternalPropertyObject;
  }) => {
    this.addProperty({
      type: 'external',
      predicate: details.predicate,
      object: details.object,
    });
    this.modalOpen = false;
  };

  cancel = () => {
    this.modalOpen = false;
  };

  addBacklink = (_backlink: Backlink) => {
    throw new NotImplementedError();
  };

  addProperty = (property: Property) => {
    // This function can only be called when the selected node defines a resource
    if (this.currentResource) {
      this.controller?.doCommand(
        addProperty({ resource: this.currentResource, property }),
      );
    }
  };

  getNodeById = (rdfaid: string) => {
    if (!this.controller) {
      return;
    }
    return getNodeByRdfaId(this.controller.mainEditorState, rdfaid);
  };
}
