import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { addProperty } from '#root/commands/rdfa-commands/add-property.ts';
import { removeProperty } from '#root/commands/rdfa-commands/remove-property.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';
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
import { not } from 'ember-truth-helpers';
import type { PNode } from '#root/prosemirror-aliases.ts';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { getSubjects } from '#root/plugins/rdfa-info/utils.ts';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import { array } from '@ember/helper';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import WithUniqueId from '../../with-unique-id.ts';
import PropertyEditorForm from './form.gts';
import { isResourceNode } from '#root/utils/node-utils.ts';
import { type Status, type StatusMessage } from '../types.ts';
import PropertyDetails from '../property-details.gts';
import { modifier } from 'ember-modifier';
import { action } from '@ember/object';
import ConfigurableRdfaDisplay, {
  predicateDisplay,
} from '../configurable-rdfa-display.gts';

interface StatusMessageForNode extends StatusMessage {
  node: PNode;
}

type Args = {
  controller: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
  objectOptions?: string[];
  predicateOptions?: string[];
};

export default class RdfaPropertyEditor extends Component<Args> {
  @tracked _statusMessage: StatusMessageForNode | null = null;
  @tracked status?: Status;

  isPlainTriple = (triple: OutgoingTriple) => !isLinkToNode(triple);

  setUpListeners = modifier(() => {
    const listenerHandler = (event: KeyboardEvent) => {
      if (event.altKey && event.ctrlKey) {
        const key = event.key;
        switch (key) {
          case 'p':
          case 'P':
            if (this.canAddProperty) {
              this.startPropertyCreation();
            }
            break;
        }
      }
    };
    window.addEventListener('keydown', listenerHandler);
    return () => {
      window.removeEventListener('keydown', listenerHandler);
    };
  });

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
  setStatusMessage = (val: StatusMessage | null) => {
    if (val) {
      this._statusMessage = { ...val, node: this.node };
    } else {
      this._statusMessage = val;
    }
  };

  closeStatusMessage = () => {
    this.setStatusMessage(null);
  };

  get type() {
    return this.node.attrs['rdfaNodeType'] as 'resource' | 'literal';
  }

  get allResources(): string[] {
    if (!this.controller) {
      return [];
    }
    return getSubjects(this.controller.mainEditorState);
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

  startPropertyCreation = () => {
    this.status = {
      mode: 'creation',
    };
  };

  startPropertyUpdate = (property: OutgoingTriple) => {
    this.status = {
      mode: 'update',
      property,
    };
  };

  get canAddProperty() {
    return isResourceNode(this.node);
  }

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

  updateProperty = (newProperty: OutgoingTriple, subject?: string) => {
    // TODO: make a command to do this in one go
    if (this.status?.mode === 'update') {
      this.removeProperty(this.status.property);
      this.addProperty(newProperty, subject);
      this.status = undefined;
    }
  };

  removeProperty = (property: OutgoingTriple) => {
    // This function can only be called when the selected node defines a resource or the selected
    // node is a document that imports resources (e.g. a snippet)
    if (this.currentResource) {
      const propertyToRemove = { resource: this.currentResource, property };
      this.controller?.doCommand(removeProperty(propertyToRemove), {
        view: this.controller.mainEditorView,
      });
    }
  };

  cancel = () => {
    this.status = undefined;
  };

  <template>
    <AuContent @skin="tiny" {{this.setUpListeners}}>
      <AuToolbar as |Group|>
        <Group>
          <AuHeading @level="6" @skin="6">Properties</AuHeading>
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
          {{#each this.properties as |prop|}}
            <Item
              class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
            >
              <div class="au-u-padding-tiny">
                <ConfigurableRdfaDisplay
                  @value={{prop}}
                  @generator={{predicateDisplay}}
                  @controller={{@controller}}
                />
                <PropertyDetails
                  @controller={{@controller}}
                  @prop={{prop}}
                  @setStatusMessage={{this.setStatusMessage}}
                />
              </div>
              <AuDropdown @icon={{ThreeDotsIcon}} role="menu" @alignment="left">
                <AuButton
                  @skin="link"
                  @icon={{PencilIcon}}
                  role="menuitem"
                  {{on "click" (fn this.startPropertyUpdate prop)}}
                >
                  Edit property
                </AuButton>
                <AuButton
                  @skin="link"
                  @icon={{BinIcon}}
                  role="menuitem"
                  class="au-c-button--alert"
                  {{on "click" (fn this.removeProperty prop)}}
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
      @controller={{@controller}}
      @modalOpen={{this.isCreating}}
      @onSave={{this.addProperty}}
      @onCancel={{this.cancel}}
      @predicateOptions={{@predicateOptions}}
      @objectOptions={{@objectOptions}}
    />
    {{! Update modal }}
    <Modal
      @controller={{@controller}}
      @modalOpen={{this.isUpdating}}
      @onSave={{this.updateProperty}}
      @onCancel={{this.cancel}}
      {{! @glint-expect-error check if property is defined }}
      @property={{this.status.property}}
      @predicateOptions={{@predicateOptions}}
      @objectOptions={{@objectOptions}}
    />
  </template>
}

interface Sig {
  Args: {
    controller?: SayController;
    property?: OutgoingTriple;
    onCancel: () => void;
    onSave: (property: OutgoingTriple, subject?: string) => void;
    modalOpen: boolean;
    title?: string;
    predicateOptions?: string[];
    objectOptions?: string[];
  };
}

class Modal extends Component<Sig> {
  @action
  onFormKeyDown(formElement: HTMLFormElement, event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      formElement.requestSubmit();
    }
    return true;
  }

  @tracked initiallyFocusedElement?: HTMLElement;

  initialFocus = modifier((element: HTMLElement) => {
    this.initiallyFocusedElement = element;
  });

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
        {{! @glint-expect-error appuniversum types should be adapted to accept an html element here }}
        @initialFocus={{this.initiallyFocusedElement}}
      >
        <:title>{{this.title}}</:title>
        <:body>
          <PropertyEditorForm
            id={{formId}}
            @initialFocus={{this.initialFocus}}
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
            @predicateOptions={{@predicateOptions}}
            @objectOptions={{@objectOptions}}
            @onKeyDown={{this.onFormKeyDown}}
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
