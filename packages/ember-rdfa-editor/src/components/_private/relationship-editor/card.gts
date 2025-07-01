import Component from '@glimmer/component';
import { localCopy, trackedReset } from 'tracked-toolbox';
import { isResourceNode } from '#root/utils/node-utils.ts';
// import RdfaPropertyEditor from './property-editor/index.gts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import type SayController from '#root/core/say-controller.ts';
// import BacklinkEditor from './backlink-editor/index.gts';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import type {
  Direction,
  SubmissionBody,
} from '#root/components/_private/relationship-editor/types.ts';
import { tracked } from 'tracked-built-ins';
import {
  addBacklinkToNode,
  removeBacklinkFromNode,
} from '#root/utils/_private/rdfa-utils.ts';
import { isRdfaAttrs, type RdfaAttrs } from '#root/core/rdfa-types.ts';
import { removeProperty } from '#root/commands/rdfa-commands/remove-property.ts';
import { addProperty } from '#root/commands/rdfa-commands/add-property.ts';
import { selectNodeBySubject } from '#root/commands/_private/rdfa-commands/select-node-by-subject.ts';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { on } from '@ember/modifier';
import { fn, hash } from '@ember/helper';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import ConfigurableRdfaDisplay, {
  predicateDisplay,
} from '#root/components/_private/common/configurable-rdfa-display.gts';
import PropertyDetails from '#root/components/_private/common/property-details.gts';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import type { PNode } from '#root/prosemirror-aliases.ts';
import type {
  PropertyOrBacklink,
  Status,
  StatusMessage,
} from '../common/types.ts';
import {
  languageOrDataType,
  sayDataFactory,
} from '#root/core/say-data-factory/data-factory.ts';
import type { FormData } from './modals/dev-mode.gts';
import { modifier } from 'ember-modifier';
import RelationshipEditorDevModeModal from './modals/dev-mode.gts';
import type { OptionGeneratorConfig } from './types.ts';
import ContentPredicateForm, {
  type SubmissionBody as ContentPredicateFormSubmissionBody,
} from './content-predicate-form.gts';
import WithUniqueId from '#root/components/_private/utils/with-unique-id.ts';
import type { ContentLiteralTerm } from '#root/core/say-data-factory/index.js';
import type { OutgoingTriple } from '#root/core/rdfa-processor.js';
import { htmlSafe } from '@ember/template';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';

interface StatusMessageForNode extends StatusMessage {
  node: PNode;
}

type Args = {
  controller: SayController;
  node: ResolvedPNode;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  optionGeneratorConfig?: OptionGeneratorConfig;
};
export default class RelationshipEditorCard extends Component<Args> {
  @tracked _statusMessage: StatusMessageForNode | null = null;
  @tracked status?: Status;
  @tracked initialFormData?: FormData;
  @trackedReset('args.node') editingContentPredicate: boolean = false;

  @localCopy('args.expanded', true) declare expanded: boolean;

  setUpListeners = modifier(() => {
    const listenerHandler = (event: KeyboardEvent) => {
      if (event.altKey && event.ctrlKey) {
        const key = event.key;
        switch (key) {
          case 'b':
          case 'B':
            this.startCreationMode('backlink');
            break;
          case 'p':
          case 'P':
            if (this.isResourceNode) {
              this.startCreationMode('property');
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

  get node() {
    return this.args.node.value;
  }

  get isRdfaAwareNode() {
    return isRdfaAttrs(this.node.attrs);
  }

  get nodeAttrs() {
    return this.node.attrs as RdfaAttrs;
  }

  get isCreating() {
    return this.status?.mode === 'creation';
  }

  get isUpdating() {
    return this.status?.mode === 'update';
  }

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  startCreationMode = (direction: Direction) => {
    this.initialFormData = {
      direction,
    };
    this.status = {
      mode: 'creation',
    };
  };

  startUpdateMode = (propertyOrBacklink: PropertyOrBacklink) => {
    if ('subject' in propertyOrBacklink) {
      this.initialFormData = {
        direction: 'backlink',
        predicate: {
          direction: 'backlink',
          term: sayDataFactory.namedNode(propertyOrBacklink.predicate),
        },
        target: {
          term: propertyOrBacklink.subject,
        },
      };
    } else {
      this.initialFormData = {
        direction: 'property',
        predicate: {
          direction: 'property',
          term: sayDataFactory.namedNode(propertyOrBacklink.predicate),
        },
        target: {
          // @ts-expect-error remove blanknode from possible object types
          term: propertyOrBacklink.object,
        },
      };
    }
    this.status = {
      mode: 'update',
      propertyOrBacklink,
    };
  };

  onFormSubmit = (body: SubmissionBody) => {
    if (this.status?.mode === 'update') {
      this.removePropertyOrBacklink(this.status.propertyOrBacklink);
    }
    const node = this.args.node;
    const { predicate, target } = body;

    if (predicate.direction === 'property') {
      const resource =
        this.nodeAttrs.rdfaNodeType === 'resource' && this.nodeAttrs.subject;
      if (!resource) {
        return;
      }
      const property = {
        predicate: predicate.term.value,
        object: target.term,
      };
      this.controller.doCommand(
        addProperty({
          resource,
          // @ts-expect-error fix type of property
          property,
        }),
      );
    } else if (predicate.direction === 'backlink') {
      const backlink = {
        subject: target.term,
        predicate: predicate.term.value,
      };
      this.controller.withTransaction(
        () => {
          return addBacklinkToNode({
            rdfaId: node.value.attrs['__rdfaId'] as string,
            // @ts-expect-error fix type of backlink
            backlink,
          })(this.controller.mainEditorState).transaction;
        },
        { view: this.controller.mainEditorView },
      );
    }

    this.status = undefined;
  };

  cancel = () => {
    this.status = undefined;
  };

  get contentPredicateProperty() {
    if (this.nodeAttrs.rdfaNodeType === 'resource') {
      return this.nodeAttrs.properties.find(
        (prop) => prop.object.termType === 'ContentLiteral',
      );
    } else {
      return;
    }
  }

  contentPredicateTextRepr = (contentPredicateProperty: OutgoingTriple) => {
    const predicate = contentPredicateProperty.predicate;
    const object = contentPredicateProperty.object as ContentLiteralTerm;
    const languageSuffix = object.language ? `@${object.language}` : '';
    const datatypeSuffix = object.datatype
      ? `^^"${object.datatype.value}"`
      : '';
    return `<strong>${predicate}</strong>${languageSuffix}${datatypeSuffix}`;
  };

  get contentPredicateInitialFormData() {
    const predicate = this.contentPredicateProperty?.predicate;
    const object = this.contentPredicateProperty?.object as
      | ContentLiteralTerm
      | undefined;
    return {
      contentPredicate: predicate,
      language: object?.language,
      datatype: object?.datatype.value,
    };
  }

  startEditingContentPredicate = () => {
    this.editingContentPredicate = true;
  };

  onContentPredicateFormCancel = () => {
    this.editingContentPredicate = false;
  };

  onContentPredicateFormSubmit = (body: ContentPredicateFormSubmissionBody) => {
    this.editingContentPredicate = false;
    if (this.contentPredicateProperty) {
      this.removePropertyOrBacklink(this.contentPredicateProperty);
    }
    if (body.contentPredicate) {
      const property = {
        predicate: body.contentPredicate,
        object: sayDataFactory.contentLiteral(
          languageOrDataType(
            body.language,
            body.datatype ? sayDataFactory.namedNode(body.datatype) : undefined,
          ),
        ),
      };
      const resource =
        this.nodeAttrs.rdfaNodeType === 'resource' && this.nodeAttrs.subject;
      if (!resource) {
        return;
      }
      this.controller.doCommand(
        addProperty({
          resource,
          property,
        }),
      );
    }
  };

  removePropertyOrBacklink = (propertyOrBacklink: PropertyOrBacklink) => {
    // This function can only be called when the selected node defines a resource or the selected
    // node is a document that imports resources (e.g. a snippet)
    if ('subject' in propertyOrBacklink) {
      const backlinkIndex =
        this.nodeAttrs.backlinks.indexOf(propertyOrBacklink);
      if (backlinkIndex === -1) {
        return;
      }
      this.controller.withTransaction(
        () => {
          return removeBacklinkFromNode({
            rdfaId: this.args.node.value.attrs['__rdfaId'] as string,
            index: backlinkIndex,
          })(this.controller.mainEditorState).transaction;
        },
        { view: this.controller.mainEditorView },
      );
    } else {
      const resource =
        this.nodeAttrs.rdfaNodeType === 'resource' && this.nodeAttrs.subject;
      if (!resource) {
        return;
      }
      const propertyToRemove = { resource, property: propertyOrBacklink };
      this.controller?.doCommand(removeProperty(propertyToRemove), {
        view: this.controller.mainEditorView,
      });
    }
  };

  get isResourceNode() {
    return isResourceNode(this.args.node.value);
  }

  get type() {
    if (this.args.node.value.type === this.controller?.schema.nodes['doc']) {
      return 'document';
    }
    return this.isResourceNode ? 'resource' : 'literal';
  }

  get controller() {
    return this.args.controller;
  }

  goToSubject = (subject: string) => {
    const succesful = this.controller.doCommand(
      selectNodeBySubject({ subject }),
      {
        view: this.controller.mainEditorView,
      },
    );
    if (!succesful) {
      this.setStatusMessage({
        type: 'info',
        message: `Node with subject ${subject} not found`,
      });
    }
    this.controller.focus();
  };

  get modalTitle() {
    if (this.status?.mode === 'update') {
      return 'Edit relationship';
    } else {
      return 'Add relationship';
    }
  }

  get properties() {
    return this.nodeAttrs.rdfaNodeType === 'resource'
      ? this.nodeAttrs.properties.filter(
          (prop) => prop.object.termType !== 'ContentLiteral',
        )
      : undefined;
  }

  get backlinks() {
    return this.nodeAttrs.backlinks;
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

  get currentTerm() {
    if (this.nodeAttrs.rdfaNodeType === 'resource') {
      return sayDataFactory.resourceNode(this.nodeAttrs.subject);
    } else {
      return sayDataFactory.literalNode(this.nodeAttrs.__rdfaId);
    }
  }

  <template>
    {{#if this.isRdfaAwareNode}}
      <AuCard
        {{this.setUpListeners}}
        @size="small"
        @expandable={{true}}
        @manualControl={{true}}
        @openSection={{this.toggleSection}}
        @isExpanded={{this.expanded}}
        as |c|
      >
        <c.header>
          <div
            class="au-u-flex au-u-flex--row au-u-flex--vertical-center au-u-flex--spaced-small"
          >
            <AuHeading @level="1" @skin="6">Relationships</AuHeading>
            <AuPill>{{this.type}}</AuPill>
          </div>
        </c.header>
        <c.content class="au-c-content--tiny">
          {{#if this.isResourceNode}}
            <AuToolbar as |Group|>
              <Group>
                <AuHeading
                  @level="2"
                  class="au-u-h6 au-u-muted"
                >Properties</AuHeading>
              </Group>
              <Group>
                <AuButton
                  @icon={{PlusIcon}}
                  @skin="link"
                  {{on "click" (fn this.startCreationMode "property")}}
                >
                  Add property
                </AuButton>
              </Group>
            </AuToolbar>
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
                        @context={{hash
                          controller=@controller
                          isTopLevel=false
                        }}
                      />
                      <PropertyDetails
                        @controller={{@controller}}
                        @prop={{prop}}
                        @setStatusMessage={{this.setStatusMessage}}
                      />
                    </div>
                    <AuDropdown
                      @icon={{ThreeDotsIcon}}
                      role="menu"
                      @alignment="left"
                    >
                      <AuButton
                        @skin="link"
                        @icon={{PencilIcon}}
                        role="menuitem"
                        {{on "click" (fn this.startUpdateMode prop)}}
                      >
                        Edit property
                      </AuButton>
                      <AuButton
                        @skin="link"
                        @icon={{BinIcon}}
                        role="menuitem"
                        class="au-c-button--alert"
                        {{on "click" (fn this.removePropertyOrBacklink prop)}}
                      >
                        Remove property
                      </AuButton>
                    </AuDropdown>
                  </Item>
                {{/each}}
              </AuList>
            {{else}}
              <p class="au-u-italic">This node doesn't have any properties yet.</p>
            {{/if}}
          {{/if}}
          {{#if this.isResourceNode}}
            <WithUniqueId as |formId|>
              <AuToolbar as |Group|>
                <Group>
                  <AuHeading @level="2" class="au-u-h6 au-u-muted">Content
                    predicate</AuHeading>
                </Group>
                <Group>
                  {{#if this.editingContentPredicate}}
                    <AuButton
                      {{on "click" this.onContentPredicateFormCancel}}
                      @skin="link-secondary"
                    >Cancel</AuButton>
                    <AuButton
                      type="submit"
                      @icon={{CheckIcon}}
                      form={{formId}}
                      @skin="link"
                    >Save</AuButton>
                  {{else}}
                    <AuButton
                      {{on "click" this.startEditingContentPredicate}}
                      @icon={{PencilIcon}}
                      @skin="link"
                    >
                      Edit
                    </AuButton>
                  {{/if}}
                </Group>
              </AuToolbar>

              {{#if this.editingContentPredicate}}
                <ContentPredicateForm
                  {{! @glint-expect-error }}
                  @source={{this.currentTerm}}
                  @optionGeneratorConfig={{@optionGeneratorConfig}}
                  id={{formId}}
                  @initialFormData={{this.contentPredicateInitialFormData}}
                  @onSubmit={{this.onContentPredicateFormSubmit}}
                />
              {{else}}
                {{#if this.contentPredicateProperty}}
                  <p>{{htmlSafe
                      (this.contentPredicateTextRepr
                        this.contentPredicateProperty
                      )
                    }}</p>
                {{else}}
                  <p class="au-u-italic">This node does not define a content
                    predicate.</p>
                {{/if}}
              {{/if}}
            </WithUniqueId>
          {{/if}}
          <AuToolbar as |Group|>
            <Group>
              <AuHeading
                @level="2"
                class="au-u-h6 au-u-muted"
              >Backlinks</AuHeading>
            </Group>
            <Group>
              <AuButton
                @icon={{PlusIcon}}
                @skin="link"
                {{on "click" (fn this.startCreationMode "backlink")}}
              >
                Add backlink
              </AuButton>
            </Group>
          </AuToolbar>
          {{#if this.backlinks.length}}
            <AuList @divider={{true}} as |Item|>
              {{#each this.backlinks as |backlink|}}
                <Item
                  class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
                >
                  <div class="au-u-padding-tiny">
                    <AuButton
                      class="au-u-padding-left-none au-u-padding-right-none"
                      @icon={{ExternalLinkIcon}}
                      @skin="link"
                      title={{backlink.subject.value}}
                      {{on
                        "click"
                        (fn this.goToSubject backlink.subject.value)
                      }}
                    >subject</AuButton>
                    <p><strong>predicate:</strong> {{backlink.predicate}}</p>
                  </div>
                  <AuDropdown
                    @icon={{ThreeDotsIcon}}
                    role="menu"
                    @alignment="left"
                  >
                    <AuButton
                      @skin="link"
                      @icon={{PencilIcon}}
                      role="menuitem"
                      {{on "click" (fn this.startUpdateMode backlink)}}
                    >
                      Edit backlink
                    </AuButton>
                    <AuButton
                      @skin="link"
                      @icon={{BinIcon}}
                      role="menuitem"
                      class="au-c-button--alert"
                      {{on "click" (fn this.removePropertyOrBacklink backlink)}}
                    >
                      Remove backlink
                    </AuButton>
                  </AuDropdown>
                </Item>
              {{/each}}
            </AuList>
          {{else}}
            <p class="au-u-italic">This node doesn't have any backlinks yet.</p>
          {{/if}}

          {{#if this.statusMessage}}
            <div>
              <AuAlert
                class="au-u-margin-none"
                @skin={{this.statusMessage.type}}
                @closable={{true}}
                @onClose={{this.closeStatusMessage}}
              >
                {{this.statusMessage.message}}
              </AuAlert>
            </div>
          {{/if}}
        </c.content>
      </AuCard>
    {{/if}}
    {{#if this.status}}
      <RelationshipEditorDevModeModal
        @title={{this.modalTitle}}
        @initialData={{this.initialFormData}}
        @source={{this.currentTerm}}
        @optionGeneratorConfig={{@optionGeneratorConfig}}
        @onSubmit={{this.onFormSubmit}}
        @onCancel={{this.cancel}}
      />
    {{/if}}
  </template>
}
