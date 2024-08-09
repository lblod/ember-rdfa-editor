import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  removeBacklink,
  selectNodeByRdfaId,
  selectNodeBySubject,
} from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';
import RelationshipEditorModal from './modal';
import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import type {
  IncomingTriple,
  LinkTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { isLinkToNode } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import ContentPredicateListComponent from './content-predicate-list';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils';
import { IMPORTED_RESOURCES_ATTR } from '@lblod/ember-rdfa-editor/plugins/imported-resources';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';

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
type CreationStatus = {
  mode: 'creation';
};
type UpdateStatus = {
  mode: 'update';
  index: number;
  triple: LinkTriple;
  subject?: string;
};
type Status = CreationStatus | UpdateStatus;

export default class RdfaRelationshipEditor extends Component<Args> {
  PlusIcon = PlusIcon;
  ExternalLinkIcon = ExternalLinkIcon;
  ThreeDotsIcon = ThreeDotsIcon;
  PencilIcon = PencilIcon;
  BinIcon = BinIcon;

  @tracked modalOpen = false;
  @tracked _statusMessage: StatusMessageForNode | null = null;

  Modal = RelationshipEditorModal;

  ContentPredicateList = ContentPredicateListComponent;
  @tracked status?: Status;
  get node(): PNode {
    return this.args.node.value;
  }

  get backlinks() {
    return this.node.attrs['backlinks'] as IncomingTriple[] | undefined;
  }

  get properties() {
    return this.node.attrs['properties'] as OutgoingTriple[] | undefined;
  }

  get hasOutgoing() {
    return this.properties?.some(isLinkToNode);
  }
  get hasContentPredicate() {
    return this.properties?.some(
      (prop) => prop.object.termType === 'ContentLiteral',
    );
  }

  get controller() {
    return this.args.controller;
  }

  get showOutgoingSection() {
    return (
      isResourceNode(this.node) ||
      (this.type === 'document' && this.documentImportedResources)
    );
  }

  get currentResource(): string | undefined {
    return (this.node.attrs['subject'] ||
      this.node.attrs['about'] ||
      this.node.attrs['resource']) as string | undefined;
  }
  get type() {
    if (this.node.type === this.controller?.schema.nodes['doc']) {
      return 'document';
    }
    return this.node.attrs['rdfaNodeType'] as 'resource' | 'literal';
  }
  get documentImportedResources() {
    return this.type === 'document' && this.node.attrs[IMPORTED_RESOURCES_ATTR];
  }

  get isResource() {
    return this.type === 'resource';
  }

  get currentRdfaId() {
    return this.node.attrs['__rdfaId'] as string;
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

  get isCreating() {
    return this.status?.mode === 'creation';
  }

  get isUpdating() {
    return this.status?.mode === 'update';
  }
  closeStatusMessage = () => {
    this.statusMessage = null;
  };
  isNodeLink = isLinkToNode;

  goToOutgoing = (outgoing: OutgoingTriple) => {
    this.closeStatusMessage();
    if (!isLinkToNode(outgoing)) {
      return;
    }
    const { object } = outgoing;
    if (!this.controller) {
      this.statusMessage = {
        message: 'No editor controller found. This is probably a bug.',
        type: 'error',
      };
      return;
    }
    if (object.termType === 'LiteralNode') {
      const result = this.controller.doCommand(
        selectNodeByRdfaId({ rdfaId: object.value }),
        { view: this.controller.mainEditorView },
      );
      if (!result) {
        this.statusMessage = {
          message: `No literal node found for id ${object.value}.`,
          type: 'error',
        };
      }
    } else {
      const result = this.controller.doCommand(
        selectNodeBySubject({ subject: object.value }),
        { view: this.controller.mainEditorView },
      );
      if (!result) {
        this.statusMessage = {
          message: `No resource node found for ${object.value}.`,
          type: 'info',
        };
      }
    }
    this.controller.focus();
  };

  goToBacklink = (backlink: IncomingTriple) => {
    this.closeStatusMessage();
    const result = this.controller?.doCommand(
      selectNodeBySubject({ subject: backlink.subject.value }),
      {
        view: this.controller.mainEditorView,
      },
    );
    if (!this.controller) {
      this.statusMessage = {
        message: 'No editor controller found. This is probably a bug.',
        type: 'error',
      };
    } else if (!result) {
      this.statusMessage = {
        message: `No resource node found for ${backlink.subject.value}.`,
        type: 'info',
      };
    }
    this.controller?.focus();
  };

  removeBacklink = (index: number) => {
    let target: Parameters<typeof removeBacklink>[0]['target'];
    if (this.currentResource) {
      target = {
        termType: 'ResourceNode',
        value: this.currentResource,
      };
    } else {
      target = {
        termType: 'LiteralNode',
        rdfaId: this.currentRdfaId,
      };
    }
    this.controller?.doCommand(removeBacklink({ target, index }), {
      view: this.controller.mainEditorView,
    });
  };

  removeProperty = (index: number) => {
    // This function can only be called when the selected node defines a resource
    if (this.currentResource) {
      this.controller?.doCommand(
        removeProperty({ resource: this.currentResource, index }),
        { view: this.controller.mainEditorView },
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
    this.status = { mode: 'creation' };
  };

  cancel = () => {
    this.status = undefined;
  };

  addBacklink = (_backlink: IncomingTriple) => {
    throw new NotImplementedError();
  };

  addProperty = (property: OutgoingTriple, subject?: string) => {
    // This function can only be called when the selected node defines a resource or the selected
    // node is a document that imports resources (e.g. a snippet)
    const resource = this.currentResource || subject;
    if (resource) {
      this.controller?.doCommand(addProperty({ resource, property }), {
        view: this.controller.mainEditorView,
      });
      this.status = undefined;
    }
  };
  editRelationship = (index: number) => {
    this.status = {
      mode: 'update',
      index,
      triple: this.properties?.[index] as LinkTriple,
      // TODO For doc nodes, need to either look up the target, to get which resource is backlinked
      // to, or it may be cleaner just to split out this case into a different component instead of
      // lumping it in to 'relationsip editor'
      // subject: ...
    };
  };

  updateProperty = (newProperty: LinkTriple) => {
    // TODO: make a command to do this in one go
    if (this.status?.mode === 'update') {
      this.removeProperty(this.status.index);
      this.addProperty(newProperty);
      this.status = undefined;
    }
  };
  updatePropertiesAttribute = (newProperties: OutgoingTriple[]) => {
    this.args.controller?.withTransaction(
      (tr) => {
        return TransformUtils.setAttribute(
          tr,
          this.args.node.pos,
          'properties',
          newProperties,
        );
      },
      { view: this.args.controller.mainEditorView },
    );
  };
  getNodeById = (rdfaid: string) => {
    if (!this.controller) {
      return;
    }
    return getNodeByRdfaId(this.controller.mainEditorState, rdfaid);
  };
}
