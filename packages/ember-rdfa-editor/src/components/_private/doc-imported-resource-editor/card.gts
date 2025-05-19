import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { and, isEmpty, not } from 'ember-truth-helpers';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { CrossIcon } from '@appuniversum/ember-appuniversum/components/icons/cross';
import type SayController from '#root/core/say-controller.ts';
import {
  addImportedResource,
  removeImportedResource,
} from '#root/plugins/rdfa-info/imported-resources.ts';
import WithUniqueId from '#root/components/_private/utils/with-unique-id.ts';
import {
  isLinkTriple,
  type OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import { getSubjectsFromBacklinksOfRelationship } from '#root/utils/rdfa-utils.ts';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';
import PropertyDetails from '#root/components/_private/common/property-details.gts';
import { addProperty, removeProperty } from '#root/commands/index.ts';
import { deepEqualPropertyList } from '#root/plugins/rdfa-info/utils.ts';
import ConfigurableRdfaDisplay, {
  predicateDisplay,
} from '#root/components/_private/common/configurable-rdfa-display.gts';
import DefineImportedResourceForm from './form.gts';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import { localCopy } from 'tracked-toolbox';
import type { SubmissionBody } from '#root/components/_private/relationship-editor/types.ts';
import RelationshipEditorDevModeModal from '../relationship-editor/modals/dev-mode.gts';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';
import type { FormData } from '../relationship-editor/modals/dev-mode.gts';
import { array } from '@ember/helper';
import type { OptionGeneratorConfig } from '../relationship-editor/types.ts';

type CreationStatus = {
  mode: 'creation';
  subject: string;
};
type UpdateStatus = {
  mode: 'update';
  subject: string;
  property: OutgoingTriple;
};

export type Status = CreationStatus | UpdateStatus;

interface Sig {
  Args: {
    controller: SayController;
    additionalImportedResources?: string[];
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    optionGeneratorConfig?: OptionGeneratorConfig;
  };
  Element: HTMLDivElement;
}

/** truth-helpers 'not' incorrectly treats [] as falsey */
function notTruthy(maybe: unknown) {
  return !maybe;
}

export default class DocImportedResourceEditorCard extends Component<Sig> {
  @localCopy('args.expanded', true) declare expanded: boolean;

  @tracked isResourceModalOpen = false;

  openResourceModal = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.isResourceModalOpen = true;
  };
  closeResourceModal = () => (this.isResourceModalOpen = false);

  @tracked status?: Status;
  @tracked initialFormData?: FormData;
  closeRelationshipModal = () => (this.status = undefined);

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  get controller() {
    return this.args.controller;
  }

  get documentNode() {
    return this.controller.mainEditorState.doc;
  }

  getSubjectPropertyMap(): Record<string, OutgoingTriple[]> {
    const importedResources = this.documentImportedResources;
    const props = this.documentNode.attrs['properties'] as OutgoingTriple[];
    if (!importedResources) return {};
    const propsAndSubjects = props.map((prop) => {
      if (!isLinkTriple(prop)) {
        return [];
      }
      const subjects = getSubjectsFromBacklinksOfRelationship(
        this.documentNode,
        importedResources,
        prop.predicate,
        prop.object,
      );
      return [prop, subjects] as [OutgoingTriple, string[]];
    });
    const mapped: Record<string, OutgoingTriple[]> = Object.fromEntries(
      importedResources.map((imp) => [imp, []]),
    );
    propsAndSubjects.forEach(([prop, subjects]) => {
      subjects?.forEach((subject) => {
        mapped[subject] = (mapped[subject] ?? []).concat(prop);
      });
    });
    return mapped;
  }

  // This isn't used to reduce re-calculations, just to re-use arrays when possible
  irCache: Record<string, OutgoingTriple[]> | undefined;
  get importedResourceProperties(): Record<string, OutgoingTriple[]> {
    if (!this.irCache) {
      // eslint-disable-next-line ember/no-side-effects
      this.irCache = {};
    }
    const newMap = this.getSubjectPropertyMap();
    // Re-use cached arrays if there are no changes to avoid re-renders that mess with on-clicks
    // eslint-disable-next-line ember/no-side-effects
    this.irCache = Object.fromEntries(
      Object.entries(newMap).map(([subject, props]) => {
        if (!this.irCache) return [subject, props];
        if (
          this.irCache[subject] &&
          deepEqualPropertyList(this.irCache[subject], props)
        ) {
          return [subject, this.irCache[subject]];
        } else {
          return [subject, props];
        }
      }),
    );
    return this.irCache;
  }

  /**
   * False if adding imported resources is not supported here, otherwise truthy, possibly empty
   * array
   */
  get documentImportedResources(): string[] | false {
    const docNodeImportedResources =
      !!this.args.controller?.schema.nodes['doc']?.spec.attrs?.[
        IMPORTED_RESOURCES_ATTR
      ] &&
      ((this.documentNode.attrs[IMPORTED_RESOURCES_ATTR] as string[]) || []);
    return (
      docNodeImportedResources &&
      Array.from(
        new Set<string>([
          ...(docNodeImportedResources || []),
          ...(this.args.additionalImportedResources || []),
        ]).values(),
      )
    );
  }

  addImportedResource = (resource: string) => {
    this.args.controller?.withTransaction(() => {
      if (!this.args.controller) return null;
      return addImportedResource({
        resource,
      })(this.args.controller.mainEditorState).transaction;
    });
    this.closeResourceModal();
  };
  removeImportedResource = (resource: string) => {
    this.args.controller?.withTransaction(() => {
      if (!this.args.controller) return null;
      return removeImportedResource({
        resource,
      })(this.args.controller.mainEditorState).transaction;
    });
  };
  startPropertyCreation = (resource: string, event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.initialFormData = {
      direction: 'property',
    };
    this.status = {
      mode: 'creation',
      subject: resource,
    };
  };
  startPropertyUpdate = (resource: string, property: OutgoingTriple) => {
    this.initialFormData = {
      direction: 'property',
      predicate: {
        direction: 'property',
        term: sayDataFactory.namedNode(property.predicate),
      },
      target: {
        // @ts-expect-error remove Blanknode as possible type
        term: property.object,
      },
    };
    this.status = {
      mode: 'update',
      subject: resource,
      property,
    };
  };

  onFormSubmit = (body: SubmissionBody) => {
    if (!this.status) {
      return;
    }
    if (this.status.mode === 'update') {
      this.removeProperty(this.status.property);
    }
    const { predicate, target } = body;
    if (predicate.direction === 'property') {
      const property = {
        predicate: predicate.term.value,
        object: target.term,
      };
      this.args.controller.doCommand(
        addProperty({
          resource: this.status.subject,
          // @ts-expect-error fix types
          property,
        }),
        {
          view: this.args.controller.mainEditorView,
        },
      );
    }

    this.closeRelationshipModal();
  };

  // TODO de-dupe this from property-editor?
  removeProperty = (property: OutgoingTriple) => {
    const propertyToRemove = {
      documentResourceNode: this.documentNode,
      importedResources: this.documentImportedResources || [],
      property,
    };
    this.args.controller?.doCommand(removeProperty(propertyToRemove), {
      view: this.args.controller.mainEditorView,
    });
  };

  get currentTerm() {
    return this.status && sayDataFactory.resourceNode(this.status.subject);
  }

  get modalTitle() {
    if (this.status?.mode === 'update') {
      return 'Edit relationship';
    } else {
      return 'Add relationship';
    }
  }

  <template>
    <AuCard
      @size="small"
      @expandable={{true}}
      @manualControl={{true}}
      @openSection={{this.toggleSection}}
      @isExpanded={{this.expanded}}
      as |c|
    >
      <c.header class="say-flex-grow">

        <AuToolbar
          class="au-u-flex au-u-flex-row au-u-flex--space-between"
          as |Group|
        >
          <Group>
            <AuHeading @level="1" @skin="6">Document imported resources</AuHeading>
          </Group>
          <Group>
            <AuButton
              @skin="link"
              @disabled={{notTruthy this.documentImportedResources}}
              {{on "click" this.openResourceModal}}
            >
              Add resource
            </AuButton>
          </Group>
        </AuToolbar>
      </c.header>
      <c.content class="au-c-content--tiny">
        {{#if
          (and this.documentImportedResources this.importedResourceProperties)
        }}
          <AuList @divider={{true}} as |IRItem|>
            {{#each-in
              this.importedResourceProperties
              as |importedResource props|
            }}
              <IRItem>
                <div
                  class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
                >
                  <strong>{{importedResource}}</strong>
                  <div>
                    <AuButton
                      @skin="link"
                      @icon={{PlusIcon}}
                      role="button"
                      {{on
                        "click"
                        (fn this.startPropertyCreation importedResource)
                      }}
                    />
                    <AuButton
                      @skin="link"
                      @alert={{true}}
                      @icon={{CrossIcon}}
                      @disabled={{not (isEmpty props)}}
                      role="button"
                      {{on
                        "click"
                        (fn this.removeImportedResource importedResource)
                      }}
                    />
                  </div>
                </div>
                <AuList @divider={{true}} as |Item|>
                  {{#each props as |prop|}}
                    <Item
                      class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
                    >
                      <div class="au-u-padding-tiny">
                        {{#if @controller}}
                          <ConfigurableRdfaDisplay
                            @value={{prop}}
                            @generator={{predicateDisplay}}
                            @controller={{@controller}}
                          />
                        {{/if}}
                        <PropertyDetails
                          @controller={{@controller}}
                          @prop={{prop}}
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
                          {{on
                            "click"
                            (fn this.startPropertyUpdate importedResource prop)
                          }}
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
              </IRItem>
            {{/each-in}}
          </AuList>
        {{else}}
          <p class="au-u-italic">This document does not define any imported
            resources.</p>
        {{/if}}
      </c.content>
    </AuCard>

    {{! Add imported resource modal }}
    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{this.isResourceModalOpen}}
        @closable={{true}}
        @closeModal={{this.closeResourceModal}}
      >
        <:title>Add Imported Resource</:title>
        <:body>
          <DefineImportedResourceForm
            id={{formId}}
            @onSave={{this.addImportedResource}}
            @onCancel={{this.closeResourceModal}}
            @controller={{@controller}}
          />
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton form={{formId}} type="submit">Save</AuButton>
            <AuButton
              @skin="secondary"
              {{on "click" this.closeResourceModal}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    </WithUniqueId>

    {{#if this.status}}
      <RelationshipEditorDevModeModal
        @title={{this.modalTitle}}
        @initialData={{this.initialFormData}}
        @supportedDirections={{array "property"}}
        {{! @glint-expect-error }}
        @source={{this.currentTerm}}
        @optionGeneratorConfig={{@optionGeneratorConfig}}
        @onSubmit={{this.onFormSubmit}}
        @onCancel={{this.closeRelationshipModal}}
      />
    {{/if}}
  </template>
}
