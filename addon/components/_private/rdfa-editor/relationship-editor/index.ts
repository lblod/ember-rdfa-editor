import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  addProperty,
  insertRelation,
  removeBacklinkFromLiteral,
  removeBacklinkFromResource,
  removeProperty,
  selectNodeByRdfaId,
  selectNodeByResource,
} from '@lblod/ember-rdfa-editor/commands/rdfa-commands';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';
import { getAllRdfaIds } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import RelationshipEditorModal, { AddRelationshipType } from './modal';
import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  Backlink,
  ExternalProperty,
  ExternalPropertyObject,
  Property,
} from '@lblod/ember-rdfa-editor/core/say-parser';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};

export default class RdfaRelationshipEditor extends Component<Args> {
  @tracked addRelationshipType?: AddRelationshipType;

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

  // TODO this probably shouldn't be calculated every time
  get allRdfaids() {
    if (!this.controller) throw Error('No Controller');
    return getAllRdfaIds(this.controller.mainEditorState.doc);
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
    if (this.currentResource) {
      this.controller?.doCommand(
        removeBacklinkFromResource({ resource: this.currentResource, index }),
      );
    } else {
      // This is a content node, so there is only 1 backlink.
      this.controller?.doCommand(
        removeBacklinkFromLiteral({ rdfaId: this.currentRdfaId }),
      );
    }
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
    this.addRelationshipType = 'unspecified';
  };
  setAddRelationshipType = (type: AddRelationshipType | null) => {
    this.addRelationshipType = type ?? undefined;
  };

  saveNewRelationship = (predicate: string, rdfaid: string) => {
    switch (this.addRelationshipType) {
      case 'existing': {
        const node = this.getNodeById(rdfaid)?.value;
        if (!node) {
          return false;
        }
        this.relateNodes(predicate, node);
        this.addRelationshipType = undefined;
        return true;
      }
      case 'content':
      case 'resource':
        return this.addNode(this.addRelationshipType, predicate);
      default:
        throw new NotImplementedError();
    }
  };

  addNode = (type: 'content' | 'resource', predicate: string) => {
    // This function can only be called when the selected node defines a resource
    if (this.currentResource) {
      this.controller?.doCommand(
        insertRelation({ subject: this.currentResource, type, predicate }),
      );
      this.addRelationshipType = undefined;
    }
  };

  addBacklink = (_backlink: Backlink) => {
    throw new NotImplementedError();
  };

  relateNodes(predicate: string, obj: PNode) {
    const resource = obj.attrs.resource as string | undefined;
    const rdfaId = obj.attrs.__rdfaId as string;
    let object: ExternalPropertyObject;
    if (resource) {
      object = {
        type: 'resource',
        resource,
      };
    } else {
      object = {
        type: 'literal',
        rdfaId,
      };
    }
    this.addProperty({
      type: 'external',
      predicate,
      object,
    });
  }

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
