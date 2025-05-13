import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { addProperty } from '#root/commands/rdfa-commands/add-property.ts';
import { removeProperty } from '#root/commands/rdfa-commands/remove-property.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';
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
import { isResourceNode } from '#root/utils/node-utils.ts';
import { type Status, type StatusMessage } from '../types.ts';
import PropertyDetails from '../property-details.gts';
import { modifier } from 'ember-modifier';
import ConfigurableRdfaDisplay, {
  predicateDisplay,
} from '#root/components/_private/common/configurable-rdfa-display.gts';
import type {
  ObjectOptionGenerator,
  PredicateOptionGenerator,
  SubjectOptionGenerator,
  SubmissionBody,
} from '../relationship-editor/types.ts';
import RelationshipEditorDevModal, {
  type FormData,
} from '../relationship-editor/modal-dev-mode.gts';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';

interface StatusMessageForNode extends StatusMessage {
  node: PNode;
}

type Args = {
  controller: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
  predicateOptionGenerator?: PredicateOptionGenerator;
  subjectOptionGenerator?: SubjectOptionGenerator;
  objectOptionGenerator?: ObjectOptionGenerator;
};

export default class RdfaPropertyEditor extends Component<Args> {
  @tracked _statusMessage: StatusMessageForNode | null = null;
  @tracked status?: Status;

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

  get currentTerm() {
    return sayDataFactory.resourceNode(this.currentResource);
  }

  get initialFormData(): FormData | undefined {
    if (!this.status) {
      return;
    }
    if (this.status.mode === 'update') {
      return {
        direction: 'property',
        predicate: {
          term: sayDataFactory.namedNode(this.status.property.predicate),
          direction: 'property',
        },
        target: {
          // @ts-expect-error fix types of outgoing-triple
          term: this.status.property.object,
        },
      };
    } else {
      return {
        direction: 'property',
      };
    }
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

  addProperty = (body: SubmissionBody) => {
    // This function can only be called when the selected node defines a resource or the selected
    // node is a document that imports resources (e.g. a snippet)
    const resource = this.currentResource;
    if (resource) {
      const property: OutgoingTriple = {
        predicate: body.predicate.term.value,
        // @ts-expect-error fix term types
        object: body.target.term,
      };
      this.controller?.doCommand(addProperty({ resource, property }), {
        view: this.controller.mainEditorView,
      });
      this.status = undefined;
    }
  };

  updateProperty = (body: SubmissionBody) => {
    // TODO: make a command to do this in one go
    if (this.status?.mode === 'update') {
      this.removeProperty(this.status.property);
      this.addProperty(body);
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

  get modalTitle() {
    if (this.isUpdating) {
      return 'Edit relationship';
    } else {
      return 'Add relationship';
    }
  }

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
    {{#if this.status}}
      <RelationshipEditorDevModal
        @title={{this.modalTitle}}
        @initialData={{this.initialFormData}}
        @source={{this.currentTerm}}
        @subjectOptionGenerator={{@subjectOptionGenerator}}
        @predicateOptionGenerator={{@predicateOptionGenerator}}
        @objectOptionGenerator={{@objectOptionGenerator}}
        @onSubmit={{if this.isCreating this.addProperty this.updateProperty}}
        @onCancel={{this.cancel}}
      />
    {{/if}}
  </template>
}
