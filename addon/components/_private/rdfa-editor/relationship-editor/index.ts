import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils';
import {
  removeBacklink,
  selectNodeByRdfaId,
  selectNodeByResource,
} from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands';
import { addProperty, removeProperty } from '@lblod/ember-rdfa-editor/commands';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors';
import RelationshipEditorModal from './modal';
import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import {
  Backlink,
  NodeLinkObject,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { isLinkToNode } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';

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
  @tracked modalOpen = false;
  @tracked _statusMessage: StatusMessageForNode | null = null;

  Modal = RelationshipEditorModal;
  get node(): PNode {
    return this.args.node.value;
  }

  get backlinks() {
    return this.node.attrs.backlinks as Backlink[] | undefined;
  }

  get properties() {
    return this.node.attrs.properties as OutgoingTriple[] | undefined;
  }

  get hasOutgoing() {
    return this.properties?.some(isLinkToNode);
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
    if (object.termType === 'LiteralNode') {
      const result = this.controller?.doCommand(
        selectNodeByRdfaId({ rdfaId: object.rdfaId }),
        { view: this.controller.mainEditorView },
      );
      if (!result) {
        this.statusMessage = {
          message: `No literal node found for id ${object.rdfaId}.`,
          type: 'error',
        };
      }
    } else {
      const result = this.controller?.doCommand(
        selectNodeByResource({ resource: object.value }),
        { view: this.controller.mainEditorView },
      );
      if (!result) {
        this.statusMessage = {
          message: `No resource node found for ${object.value}.`,
          type: 'info',
        };
      }
    }
    this.controller?.focus();
  };

  goToBacklink = (backlink: Backlink) => {
    this.closeStatusMessage();
    const result = this.controller?.doCommand(
      selectNodeByResource({ resource: backlink.subject }),
      {
        view: this.controller.mainEditorView,
      },
    );
    if (!result) {
      this.statusMessage = {
        message: `No resource node found for ${backlink.subject}.`,
        type: 'info',
      };
    }
    this.controller?.focus();
  };

  removeBacklink = (index: number) => {
    let target: NodeLinkObject;
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
    this.modalOpen = true;
  };

  saveNewRelationship = (details: {
    predicate: string;
    object: NodeLinkObject;
  }) => {
    this.addProperty({
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

  addProperty = (property: OutgoingTriple) => {
    // This function can only be called when the selected node defines a resource
    if (this.currentResource) {
      this.controller?.doCommand(
        addProperty({ resource: this.currentResource, property }),
        { view: this.controller.mainEditorView },
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
