import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { addProperty } from '#root/commands/rdfa-commands/add-property.ts';
import { removeProperty } from '#root/commands/rdfa-commands/remove-property.ts';

import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type { OutgoingTriple } from '#root/core/rdfa-processor.ts';
import { isLinkToNode } from '#root/utils/rdfa-utils.ts';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import type SayController from '#root/core/say-controller.ts';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import { fn } from '@ember/helper';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { eq, not, or } from 'ember-truth-helpers';
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import { selectNodeByRdfaId } from '#root/commands/_private/rdfa-commands/select-node-by-rdfa-id.ts';
import { selectNodeBySubject } from '#root/commands/_private/rdfa-commands/select-node-by-subject.ts';
import type { PNode } from '#root/prosemirror-aliases.ts';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { getSubjects } from '#root/plugins/rdfa-info/utils.ts';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import { array } from '@ember/helper';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import WithUniqueId from '../../with-unique-id.ts';
import PropertyEditorForm from './form.gts';
import { isResourceNode } from '#root/utils/node-utils.ts';

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
  property: OutgoingTriple;
};
type Status = CreationStatus | UpdateStatus;
type Args = {
  controller: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
};
export default class RdfaPropertyEditor extends Component<Args> {
  @tracked _statusMessage: StatusMessageForNode | null = null;
  @tracked status?: Status;

  isPlainTriple = (triple: OutgoingTriple) => !isLinkToNode(triple);

  get node(): PNode {
    return this.args.node.value;
  }

  get controller() {
    return this.args.controller;
  }

  get properties() {
    return this.args.node.value.attrs['properties'] as OutgoingTriple[];
  }

  get isCreating() {
    return this.status?.mode === 'creation';
  }

  get isUpdating() {
    return this.status?.mode === 'update';
  }

  get currentResource() {
    return this.args.node.value.attrs['subject'] as string;
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

  get type() {
    if (this.node.type === this.controller?.schema.nodes['doc']) {
      return 'document';
    }
    return this.node.attrs['rdfaNodeType'] as 'resource' | 'literal';
  }

  get allResources(): string[] {
    if (!this.controller) {
      return [];
    }
    return getSubjects(this.controller.mainEditorState);
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

  get importedResources(): Record<string, string | undefined> | undefined {
    return this.node.attrs['importedResources'] as
      | Record<string, string | undefined>
      | undefined;
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

  startPropertyCreation = () => {
    this.status = {
      mode: 'creation',
    };
  };

  startPropertyUpdate = (index: number) => {
    this.status = {
      mode: 'update',
      index,
      property: this.properties[index],
    };
  };

  get canAddProperty() {
    return (
      isResourceNode(this.node) ||
      Boolean(this.node.attrs[IMPORTED_RESOURCES_ATTR])
    );
  }

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

  updateProperty = (newProperty: OutgoingTriple, subject?: string) => {
    // TODO: make a command to do this in one go
    if (this.status?.mode === 'update') {
      this.removeProperty(this.status.index);
      this.addProperty(newProperty, subject);
      this.status = undefined;
    }
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

  cancel = () => {
    this.status = undefined;
  };

  hasDataType = (obj: OutgoingTriple['object']) => {
    return 'datatype' in obj;
  };

  hasLanguage = (obj: OutgoingTriple['object']) => {
    return 'language' in obj;
  };
  <template>
    <AuContent @skin="tiny">
      <AuToolbar as |Group|>
        <Group>
          <AuHeading @level="5" @skin="5">Properties</AuHeading>
        </Group>
        <Group>
          <AuButton
            @disabled={{not this.canAddProperty}}
            @icon={{PlusIcon}}
            @skin="naked"
            {{on "click" this.startPropertyCreation}}
          >
            Add property
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
      {{#if this.properties.length}}
        <AuList @divider={{true}} as |Item|>
          {{#each this.properties as |prop index|}}
            <Item
              class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
            >
              <div class="au-u-padding-tiny">
                <p><strong>predicate:</strong> {{prop.predicate}}</p>
                {{#if (this.hasDataType prop.object)}}
                  <p><strong>datatype:</strong>
                    {{prop.object.datatype.value}}</p>
                {{/if}}
                {{#if (this.hasLanguage prop.object)}}
                  <p><strong>language:</strong> {{prop.object.language}}</p>
                {{/if}}
                {{#if (eq prop.object.termType "ContentLiteral")}}
                  <AuPill>content-predicate</AuPill>
                {{else if
                  (or
                    (eq prop.object.termType "LiteralNode")
                    (eq prop.object.termType "ResourceNode")
                  )
                }}
                  <AuButton
                    class="au-u-padding-left-none au-u-padding-right-none"
                    @icon={{ExternalLinkIcon}}
                    @skin="link"
                    title={{prop.object.value}}
                    {{on "click" (fn this.goToOutgoing prop)}}
                  >value</AuButton>
                {{else}}
                  <p><strong>value:</strong> {{prop.object.value}}</p>
                {{/if}}
              </div>
              <AuDropdown @icon={{ThreeDotsIcon}} role="menu" @alignment="left">
                <AuButton
                  @skin="link"
                  @icon={{PencilIcon}}
                  role="menuitem"
                  {{on "click" (fn this.startPropertyUpdate index)}}
                >
                  Edit property
                </AuButton>
                <AuButton
                  @skin="link"
                  @icon={{BinIcon}}
                  role="menuitem"
                  class="au-c-button--alert"
                  {{on "click" (fn this.removeProperty index)}}
                >
                  Remove property
                </AuButton>
              </AuDropdown>
            </Item>
          {{/each}}
        </AuList>
      {{else}}
        <p>This node doesn't have any properties yet.</p>
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
    <Modal
      @importedResources={{this.allImportedResources}}
      @controller={{@controller}}
      @modalOpen={{this.isCreating}}
      @onSave={{this.addProperty}}
      @onCancel={{this.cancel}}
    />
    {{! Update modal }}
    <Modal
      @importedResources={{this.allImportedResources}}
      @controller={{@controller}}
      @modalOpen={{this.isUpdating}}
      @onSave={{this.updateProperty}}
      @onCancel={{this.cancel}}
      {{! @glint-expect-error check if property is defined }}
      @property={{this.status.property}}
    />
  </template>
}

interface Sig {
  Args: {
    controller: SayController;
    property?: OutgoingTriple;
    onCancel: () => void;
    onSave: (property: OutgoingTriple, subject?: string) => void;
    modalOpen: boolean;
    importedResources?: string[] | false;
    title?: string;
  };
}

class Modal extends Component<Sig> {
  cancel = () => {
    this.args.onCancel();
  };

  save = (triple: OutgoingTriple, subject?: string) => {
    this.args.onSave(triple, subject);
  };
  get title() {
    return this.args.title ?? 'Edit';
  }
  <template>
    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{@modalOpen}}
        @closable={{true}}
        @closeModal={{this.cancel}}
      >
        <:title>{{this.title}}</:title>
        <:body>
          <PropertyEditorForm
            id={{formId}}
            @onSubmit={{this.save}}
            @termTypes={{array
              "NamedNode"
              "Literal"
              "ContentLiteral"
              "LiteralNode"
              "ResourceNode"
            }}
            @controller={{@controller}}
            @triple={{@property}}
            @importedResources={{@importedResources}}
          />
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton form={{formId}} type="submit">Save</AuButton>
            <AuButton
              @skin="secondary"
              {{on "click" this.cancel}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    </WithUniqueId>
  </template>
}
