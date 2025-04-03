import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { and, isEmpty } from 'ember-truth-helpers';
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
import { addImportedResource } from '#root/plugins/rdfa-info/imported-resources.ts';
import WithUniqueId from '#root/components/_private/with-unique-id.ts';
import { type OutgoingTriple } from '#root/core/rdfa-processor.ts';
import { getSubjectsFromBacklinksOfRelationship } from '#root/utils/_private/rdfa-utils.ts';
import { type ResolvedPNode } from '#root/utils/_private/types.ts';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';
import RelationshipEditorForm from './form.gts';
import PropertyDetails from '../property-details.gts';

type Args = {
  controller?: SayController;
  node: ResolvedPNode;
  additionalImportedResources?: string[];
};

/** truth-helpers 'not' incorrectly treats [] as falsey */
function notTruthy(maybe: unknown) {
  return !maybe;
}

export default class DocImportedResourceEditor extends Component<Args> {
  @tracked isModalOpen = false;

  get node(): PNode {
    return this.args.node.value;
  }

  openModal = () => (this.isModalOpen = true);
  closeModal = () => (this.isModalOpen = false);

  get importedResourceProperties(): Record<string, OutgoingTriple[]> {
    const importedResources = this.documentImportedResources;
    const properties = this.args.node.value.attrs[
      'properties'
    ] as OutgoingTriple[];
    if (importedResources) {
      // TODO do we need to memoize these results?
      const mapped: Record<string, OutgoingTriple[]> = Object.fromEntries(
        importedResources.map((imp) => [imp, []]),
      );
      properties
        .map((property) => {
          const subjects = getSubjectsFromBacklinksOfRelationship(
            this.node,
            importedResources,
            property.predicate,
            property.object.value,
          );
          return [subjects[0], property] as [
            string | undefined,
            OutgoingTriple,
          ];
        })
        .forEach(([subject, property]) => {
          if (subject) {
            mapped[subject] = (mapped[subject] ?? []).concat(property);
          }
        });
      return mapped;
    } else {
      return {};
    }
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
    this.closeModal();
  };
  removeImportedResource = (_resource: string) => {
    console.error('not implemented');
    throw new Error('not implemented');
  };
  addPropToImported = (_resource: string) => {
    console.error('not implemented');
    throw new Error('not implemented');
  };

  <template>
    <AuContent @skin="tiny">
      <AuToolbar as |Group|>
        <Group>
          <AuHeading @level="5" @skin="5">Imported Resources</AuHeading>
        </Group>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin="naked"
            @disabled={{notTruthy this.documentImportedResources}}
            {{on "click" this.openModal}}
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
                    @disabled={{isEmpty props}}
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
                    <PropertyDetails
                      @controller={{@controller}}
                      @prop={{prop}}
                    />
                    <AuDropdown
                      @icon={{ThreeDotsIcon}}
                      role="menu"
                      @alignment="left"
                    >
                      <AuButton
                        @skin="link"
                        @icon={{PencilIcon}}
                        role="menuitem"
                      >
                        Edit property
                      </AuButton>
                      <AuButton
                        @skin="link"
                        @icon={{BinIcon}}
                        role="menuitem"
                        class="au-c-button--alert"
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

    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{this.isModalOpen}}
        @closable={{true}}
        @closeModal={{this.closeModal}}
      >
        <:title>Add Imported Resource</:title>
        <:body>
          <RelationshipEditorForm
            id={{formId}}
            @onSave={{this.addImportedResource}}
            @onCancel={{this.closeModal}}
            @controller={{@controller}}
          />
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton form={{formId}} type="submit">Save</AuButton>
            <AuButton
              @skin="secondary"
              {{on "click" this.closeModal}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    </WithUniqueId>
  </template>
}
