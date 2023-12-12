import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  insertRelation,
  InsertRelationDetails,
  removeBacklink,
  selectNodeByRdfaId,
  selectNodeByResource,
} from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';
import RelationshipEditorModal, { AddRelationshipType } from './modal';
import {
  getNodeByRdfaId,
  rdfaInfoPluginKey,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  Backlink,
  ExternalProperty,
  ExternalPropertyObject,
  Property,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};

interface StatusMessage {
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}
interface StatusMessageForNode extends StatusMessage {
  node: PNode;
}

export default class RdfaRelationshipEditor extends Component<Args> {
  @tracked addRelationshipType?: AddRelationshipType;
  @tracked _statusMessage: StatusMessageForNode | null = null;

  Modal = RelationshipEditorModal;
  get node(): PNode {
    return this.args.node.value;
  }

  get backlinks() {
    return this.node.attrs.backlinks as Backlink[] | undefined;
  }

  get properties() {
    return this.node.attrs.properties as Property[] | undefined;
  }

  get hasOutgoing() {
    return this.properties?.some((prop) => prop.type === 'external');
  }

  get controller() {
    return this.args.controller;
  }

  get showOutgoingSection() {
    return isResourceNode(this.node);
  }

  get currentResource() {
    return this.node.attrs.resource as string | undefined;
  }

  get currentRdfaId() {
    return this.node.attrs.__rdfaId as string;
  }
  get statusMessage(): StatusMessage | null {
    // show only if a message is relevant for the current node
    if (this._statusMessage && this.node === this._statusMessage.node) {
      return this._statusMessage;
    }
    return null;
  }
  set statusMessage(val: StatusMessage | null) {
    if (val) {
      this._statusMessage = { ...val, node: this.node };
    } else {
      this._statusMessage = val;
    }
  }

  get allRdfaids() {
    if (!this.controller) throw Error('No Controller');
    const pluginState = rdfaInfoPluginKey.getState(
      this.controller.mainEditorState,
    );

    return pluginState
      ? [...pluginState.rdfaIdMapping.keys()].map((key) => {
          const node = unwrap(pluginState.rdfaIdMapping.get(key)?.value);
          const resource = node.attrs.resource as string | undefined;
          if (resource) {
            return { key, label: `Resource: ${resource} - [${key}]` };
          } else {
            return {
              key,
              label: `Literal: ${node.textContent.substring(
                0,
                20,
              )}... - [${key}]`,
            };
          }
        })
      : [];
  }
  closeStatusMessage = () => {
    this.statusMessage = null;
  };

  goToOutgoing = (outgoing: ExternalProperty) => {
    this.closeStatusMessage();
    const { object } = outgoing;
    if (object.type === 'literal') {
      const result = this.controller?.doCommand(
        selectNodeByRdfaId({ rdfaId: object.rdfaId }),
      );
      if (!result) {
        this.statusMessage = {
          message: `No literal node found for id ${object.rdfaId}.`,
          type: 'error',
        };
      }
    } else {
      const result = this.controller?.doCommand(
        selectNodeByResource({ resource: object.resource }),
      );
      if (!result) {
        this.statusMessage = {
          message: `No resource node found for ${object.resource}.`,
          type: 'info',
        };
      }
    }
  };

  goToBacklink = (backlink: Backlink) => {
    this.closeStatusMessage();
    const result = this.controller?.doCommand(
      selectNodeByResource({ resource: backlink.subject }),
    );
    if (!result) {
      this.statusMessage = {
        message: `No resource node found for ${backlink.subject}.`,
        type: 'info',
      };
    }
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
    if (isResourceNode(this.node)) {
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

  saveNewRelationship = (
    details:
      | {
          type: 'existing';
          predicate: string;
          rdfaid: string;
        }
      | InsertRelationDetails,
  ) => {
    switch (details.type) {
      case 'existing': {
        const node = this.getNodeById(details.rdfaid)?.value;
        if (!node) {
          return false;
        }
        this.relateNodes(details.predicate, node);
        this.addRelationshipType = undefined;
        return true;
      }
      case 'literal':
      case 'resource':
        return this.addNode(details);
      default:
        throw new NotImplementedError();
    }
  };

  addNode = (details: InsertRelationDetails) => {
    // This function can only be called when the selected node defines a resource
    if (this.currentResource) {
      this.controller?.doCommand(
        insertRelation({
          subject: this.currentResource,
          ...details,
        }),
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
