import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { and, isEmpty, not } from 'ember-truth-helpers';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
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
import { type PNode } from '#root/prosemirror-aliases.ts';
import {
  addImportedResource,
  removeImportedResource,
} from '#root/plugins/rdfa-info/imported-resources.ts';
import WithUniqueId from '#root/components/_private/with-unique-id.ts';
import {
  isLinkTriple,
  type OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import { getSubjectsFromBacklinksOfRelationship } from '#root/utils/rdfa-utils.ts';
import { type ResolvedPNode } from '#root/utils/_private/types.ts';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';
import RelationshipEditorForm from './form.gts';
import PropertyDetails from '../property-details.gts';
import { type Status } from '../types.ts';
import PropertyEditorForm from '../property-editor/form.gts';
import { array } from '@ember/helper';
import { isSome } from '#root/utils/_private/option.ts';
import { addProperty, removeProperty } from '#root/commands/index.ts';
import { deepEqualPropertyList } from '#root/plugins/rdfa-info/utils.ts';
import PredicateDisplay from '../predicate-display.gts';

interface Sig {
  Args: {
    controller?: SayController;
    node: ResolvedPNode;
    additionalImportedResources?: string[];
  };
  Element: HTMLDivElement;
}

/** truth-helpers 'not' incorrectly treats [] as falsey */
function notTruthy(maybe: unknown) {
  return !maybe;
}

export default class DocImportedResourceEditor extends Component<Sig> {
  @tracked isResourceModalOpen = false;
  openResourceModal = () => (this.isResourceModalOpen = true);
  closeResourceModal = () => (this.isResourceModalOpen = false);

  @tracked propertyModalStatus?: Status;
  closePropertyModal = () => (this.propertyModalStatus = undefined);

  get node(): PNode {
    return this.args.node.value;
  }

  getSubjectPropertMap(): Record<string, OutgoingTriple[]> {
    const importedResources = this.documentImportedResources;
    const props = this.args.node.value.attrs['properties'] as OutgoingTriple[];
    if (!importedResources) return {};
    const propsAndSubjects = props.map((prop) => {
      if (!isLinkTriple(prop)) {
        return [];
      }
      const subjects = getSubjectsFromBacklinksOfRelationship(
        this.node,
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
    const newMap = this.getSubjectPropertMap();
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
      ((this.node.attrs[IMPORTED_RESOURCES_ATTR] as string[]) || []);
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
  addPropToImported = (resource: string) => {
    this.propertyModalStatus = {
      mode: 'creation',
      subject: resource,
    };
  };
  startPropertyUpdate = (resource: string, property: OutgoingTriple) => {
    this.propertyModalStatus = {
      mode: 'update',
      subject: resource,
      property,
    };
  };

  // TODO de-dupe this from property-editor?
  addProperty = (property: OutgoingTriple, subject?: string) => {
    const resource = subject ?? this.propertyModalStatus?.subject;
    if (resource) {
      const isNewImportedResource =
        subject !== this.propertyModalStatus?.subject;
      this.args.controller?.doCommand(
        addProperty({ resource, property, isNewImportedResource }),
        {
          view: this.args.controller.mainEditorView,
        },
      );
      this.closePropertyModal();
    }
  };

  // TODO de-dupe this from property-editor?
  updateProperty = (newProperty: OutgoingTriple, subject?: string) => {
    // TODO: make a command to do this in one go
    if (this.propertyModalStatus?.mode === 'update') {
      this.removeProperty(this.propertyModalStatus.property);
    }
    this.addProperty(newProperty, subject);
    this.closePropertyModal();
  };

  // TODO de-dupe this from property-editor?
  removeProperty = (property: OutgoingTriple) => {
    const propertyToRemove = {
      documentResourceNode: this.node,
      importedResources: this.documentImportedResources || [],
      property,
    };
    this.args.controller?.doCommand(removeProperty(propertyToRemove), {
      view: this.args.controller.mainEditorView,
    });
  };

  <template>
    <AuContent @skin="tiny" ...attributes>
      <AuToolbar as |Group|>
        <Group>
          <AuHeading @level="5" @skin="5">Imported Resources</AuHeading>
        </Group>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin="naked"
            @disabled={{notTruthy this.documentImportedResources}}
            {{on "click" this.openResourceModal}}
          >
            Add imported resource
          </AuButton>
        </Group>
      </AuToolbar>
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
                    {{on "click" (fn this.addPropToImported importedResource)}}
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
                      <PredicateDisplay
                        @controller={{@controller}}
                        @prop={{prop}}
                      />
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
      {{/if}}
    </AuContent>

    {{! Add imported resource modal }}
    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{this.isResourceModalOpen}}
        @closable={{true}}
        @closeModal={{this.closeResourceModal}}
      >
        <:title>Add Imported Resource</:title>
        <:body>
          <RelationshipEditorForm
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

    {{! Add property modal }}
    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{isSome this.propertyModalStatus}}
        @closable={{true}}
        @closeModal={{this.closePropertyModal}}
      >
        <:title>Edit</:title>
        <:body>
          <PropertyEditorForm
            id={{formId}}
            @onSubmit={{this.updateProperty}}
            @termTypes={{array "LiteralNode" "ResourceNode"}}
            @controller={{@controller}}
            @subject={{this.propertyModalStatus.subject}}
            {{! @glint-expect-error check if status is defined }}
            @triple={{this.propertyModalStatus.property}}
            @importedResources={{this.documentImportedResources}}
          />
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton form={{formId}} type="submit">Save</AuButton>
            <AuButton
              @skin="secondary"
              {{on "click" this.closePropertyModal}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    </WithUniqueId>
  </template>
}
