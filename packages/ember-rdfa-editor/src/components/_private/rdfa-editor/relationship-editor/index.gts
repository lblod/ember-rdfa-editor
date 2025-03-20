import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { not } from 'ember-truth-helpers';
import { isResourceNode } from '@lblod/ember-rdfa-editor/utils/node-utils.ts';
import {
  removeBacklink,
  selectNodeByRdfaId,
  selectNodeBySubject,
} from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/index.ts';
import { addProperty } from '@lblod/ember-rdfa-editor/commands/rdfa-commands/add-property.ts';
import { removeProperty } from '@lblod/ember-rdfa-editor/commands/rdfa-commands/remove-property.ts';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/_private/errors.ts';
import RelationshipEditorModal from './modal.gts';
import {
  getNodeByRdfaId,
  getSubjects,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info/index.ts';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types.ts';
import type {
  IncomingTriple,
  LinkTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor.ts';
import {
  isLinkToNode,
  getBacklinks,
  getProperties,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils.ts';
import ContentPredicateList from './content-predicate-list.ts';
import TransformUtils from '@lblod/ember-rdfa-editor/utils/_private/transform-utils.ts';
import { IMPORTED_RESOURCES_ATTR } from '@lblod/ember-rdfa-editor/plugins/imported-resources/index.ts';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import type SayController from '@lblod/ember-rdfa-editor/core/say-controller.ts';
import type { PNode } from '@lblod/ember-rdfa-editor/prosemirror-aliases.ts';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
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

function statusTriple(status: Status | undefined): LinkTriple | undefined {
  return status?.mode === 'update' ? status.triple : undefined;
}

export default class RdfaRelationshipEditor extends Component<Args> {
  @tracked modalOpen = false;
  @tracked _statusMessage: StatusMessageForNode | null = null;
  @tracked status?: Status;

  get node(): PNode {
    return this.args.node.value;
  }

  get backlinks() {
    return getBacklinks(this.node);
  }

  get properties() {
    return getProperties(this.node);
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
  get documentImportedResources(): string[] | false {
    return (
      this.type === 'document' &&
      !!this.controller?.schema.nodes['doc']?.spec.attrs?.[
        IMPORTED_RESOURCES_ATTR
      ] &&
      ((this.node.attrs[IMPORTED_RESOURCES_ATTR] as string[]) || [])
    );
  }
  get allImportedResources(): string[] | false {
    return (
      this.documentImportedResources &&
      Array.from(
        new Set<string>([
          ...(this.documentImportedResources || []),
          ...(this.args.additionalImportedResources || []),
        ]).values(),
      )
    );
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

  get importedResources(): Record<string, string | undefined> | undefined {
    return this.node.attrs['importedResources'] as
      | Record<string, string | undefined>
      | undefined;
  }
  get allResources(): string[] {
    if (!this.controller) {
      return [];
    }
    return getSubjects(this.controller.mainEditorState);
  }

  linkImportedResource = (imported: string, linked: string) => {
    const newImported = {
      ...this.importedResources,
      [imported]: linked,
    };
    this.controller?.withTransaction((tr) =>
      tr.setNodeAttribute(this.args.node.pos, 'importedResources', newImported),
    );
  };

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
    // This function can only be called when the selected node defines a resource or the selected
    // node is a document that imports resources (e.g. a snippet)
    if (this.currentResource || this.type === 'document') {
      const propertyToRemove =
        this.type !== 'document' && this.currentResource
          ? { resource: this.currentResource, index }
          : {
              documentResourceNode: this.node,
              importedResources: this.documentImportedResources || [],
              index,
            };
      this.controller?.doCommand(removeProperty(propertyToRemove), {
        view: this.controller.mainEditorView,
      });
    }
  };

  get canAddRelationship() {
    return isResourceNode(this.node);
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
      const isNewImportedResource =
        (subject &&
          this.documentImportedResources &&
          !this.documentImportedResources.includes(subject)) ||
        false;
      this.controller?.doCommand(
        addProperty({ resource, property, isNewImportedResource }),
        {
          view: this.controller.mainEditorView,
        },
      );
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

  updateProperty = (newProperty: OutgoingTriple, subject?: string) => {
    // TODO: make a command to do this in one go
    if (this.status?.mode === 'update') {
      this.removeProperty(this.status.index);
      this.addProperty(newProperty, subject);
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

  <template>
    <AuContent @skin="tiny">
      <AuToolbar as |Group|>
        <Group>
          <AuHeading @level="5" @skin="5">Relationships</AuHeading>
        </Group>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin="naked"
            @disabled={{not this.canAddRelationship}}
            {{on "click" this.addRelationship}}
          >
            Add relationship
          </AuButton>
        </Group>
      </AuToolbar>
      {{#if this.importedResources}}
        <div>
          <AuHeading
            @level="6"
            @skin="6"
            class="au-u-margin-bottom-small"
          >Imported Resources</AuHeading>
          <AuList @divider={{true}} as |Item|>
            {{#each-in this.importedResources as |imported linked|}}
              <Item
                class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
              >
                {{imported}}
                <AuDropdown
                  @icon={{if linked ChevronDownIcon PlusIcon}}
                  @title={{linked}}
                  role="menu"
                  @alignment="left"
                >
                  {{#each this.allResources as |res|}}
                    <AuButton
                      @skin="link"
                      @icon={{PencilIcon}}
                      role="menuitem"
                      {{on "click" (fn this.linkImportedResource imported res)}}
                    >
                      {{res}}
                    </AuButton>
                  {{/each}}
                </AuDropdown>
              </Item>
            {{/each-in}}
          </AuList>
        </div>
      {{/if}}
      {{#if this.showOutgoingSection}}
        <div>
          <AuHeading
            @level="6"
            @skin="6"
            class="au-u-margin-bottom-small"
          >Outgoing</AuHeading>
          {{#if this.hasOutgoing}}
            <AuList @divider={{true}} as |Item|>
              {{#each this.properties as |prop index|}}
                {{#if (this.isNodeLink prop)}}
                  <Item
                    class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
                  >
                    <AuButton
                      @icon={{ExternalLinkIcon}}
                      @skin="link"
                      {{on "click" (fn this.goToOutgoing prop)}}
                    >{{prop.predicate}}</AuButton>
                    <AuDropdown
                      @icon={{ThreeDotsIcon}}
                      role="menu"
                      @alignment="left"
                    >
                      <AuButton
                        @skin="link"
                        @icon={{PencilIcon}}
                        role="menuitem"
                        {{on "click" (fn this.editRelationship index)}}
                      >
                        Edit relationship
                      </AuButton>
                      <AuButton
                        @skin="link"
                        @icon={{BinIcon}}
                        role="menuitem"
                        class="au-c-button--alert"
                        {{on "click" (fn this.removeProperty index)}}
                      >
                        Remove outgoing
                      </AuButton>
                    </AuDropdown>
                  </Item>
                {{/if}}
              {{/each}}
            </AuList>
          {{else}}
            <p>This node doesn't have any outgoing relationships</p>
          {{/if}}
        </div>
      {{/if}}
      <div>
        <AuHeading
          @level="6"
          @skin="6"
          class="au-u-margin-bottom-small"
        >Backlinks</AuHeading>
        {{#if this.backlinks}}
          <AuList @divider={{true}} as |Item|>
            {{#each this.backlinks as |backlink index|}}
              <Item
                class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
              >
                <AuButton
                  @icon={{ExternalLinkIcon}}
                  @skin="link"
                  {{on "click" (fn this.goToBacklink backlink)}}
                >{{backlink.predicate}}</AuButton>
                <AuDropdown
                  @icon={{ThreeDotsIcon}}
                  role="menu"
                  @alignment="left"
                >
                  <AuButton
                    @skin="link"
                    @icon={{BinIcon}}
                    role="menuitem"
                    class="au-c-button--alert"
                    {{on "click" (fn this.removeBacklink index)}}
                  >
                    Remove backlink
                  </AuButton>
                </AuDropdown>
              </Item>
            {{/each}}
          </AuList>
        {{else}}
          <p>This node does not have any backlinks</p>
        {{/if}}
      </div>
      {{#if this.isResource}}
        <div>
          <AuHeading @level="6" @skin="6" class="au-u-margin-bottom-small">
            Content Predicate
          </AuHeading>
          {{#if this.properties}}
            <ContentPredicateList
              @properties={{this.properties}}
              @removeProperty={{this.removeProperty}}
            />
          {{/if}}
        </div>
      {{/if}}
      {{#if this.statusMessage}}
        <div>
          <AuAlert
            @skin={{this.statusMessage.type}}
            @closable={{true}}
            @onClose={{this.closeStatusMessage}}
          >
            {{this.statusMessage.message}}
          </AuAlert>
        </div>
      {{/if}}
    </AuContent>

    {{! Creation modal }}
    <RelationshipEditorModal
      @importedResources={{this.allImportedResources}}
      @modalOpen={{this.isCreating}}
      @onSave={{this.addProperty}}
      @onCancel={{this.cancel}}
      @controller={{this.controller}}
    />
    {{! Update modal }}
    <RelationshipEditorModal
      @importedResources={{this.allImportedResources}}
      @modalOpen={{this.isUpdating}}
      @onSave={{this.updateProperty}}
      @onCancel={{this.cancel}}
      @triple={{statusTriple this.status}}
      @controller={{this.controller}}
    />
  </template>
}
