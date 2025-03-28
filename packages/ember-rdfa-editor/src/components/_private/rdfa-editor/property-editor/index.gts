import Component from '@glimmer/component';
import { unwrap } from '#root/utils/_private/option.ts';
import { tracked } from '@glimmer/tracking';
import PropertyEditorModal from './modal.gts';
import { addProperty } from '#root/commands/rdfa-commands/add-property.ts';
import { removeProperty } from '#root/commands/rdfa-commands/remove-property.ts';

import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import TransformUtils from '#root/utils/_private/transform-utils.ts';
import type { OutgoingTriple, PlainTriple } from '#root/core/rdfa-processor.ts';
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
import { eq } from 'ember-truth-helpers';

type CreationStatus = {
  mode: 'creation';
};
type UpdateStatus = {
  mode: 'update';
  index: number;
  property: PlainTriple;
};
type Status = CreationStatus | UpdateStatus;
type Args = {
  controller?: SayController;
  node: ResolvedPNode;
};
export default class RdfaPropertyEditor extends Component<Args> {
  @tracked status?: Status;

  isPlainTriple = (triple: OutgoingTriple) => !isLinkToNode(triple);

  get properties() {
    return this.args.node.value.attrs['properties'] as
      | OutgoingTriple[]
      | undefined;
  }

  get hasAttributeProperties() {
    return this.properties?.some((prop) => !isLinkToNode(prop));
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

  startPropertyCreation = () => {
    this.status = {
      mode: 'creation',
    };
  };

  startPropertyUpdate = (index: number) => {
    this.status = {
      mode: 'update',
      index,
      property: this.properties?.[index] as PlainTriple,
    };
  };

  addProperty = (property: PlainTriple) => {
    this.args.controller?.doCommand(
      addProperty({
        resource: this.currentResource,
        property,
      }),
      { view: this.args.controller.mainEditorView },
    );
    this.status = undefined;
  };

  updateProperty = (newProperty: PlainTriple) => {
    const { index } = this.status as UpdateStatus;
    const newProperties = unwrap(this.properties).slice();
    newProperties[index] = newProperty;
    this.updatePropertiesAttribute(newProperties);
    this.status = undefined;
  };

  removeProperty = (index: number) => {
    this.args.controller?.doCommand(
      removeProperty({ resource: this.currentResource, index }),
      { view: this.args.controller.mainEditorView },
    );
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
            @icon={{PlusIcon}}
            @skin="naked"
            {{on "click" this.startPropertyCreation}}
          >
            Add property
          </AuButton>
        </Group>
      </AuToolbar>
      {{#if this.hasAttributeProperties}}
        <AuList @divider={{true}} as |Item|>
          {{#each this.properties as |prop index|}}
            {{#if (this.isPlainTriple prop)}}
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
                  {{else}}
                    <p><strong>value:</strong> {{prop.object.value}}</p>
                  {{/if}}
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
            {{/if}}
          {{/each}}
        </AuList>
      {{else}}
        <p>This node doesn't have any properties yet.</p>
      {{/if}}
    </AuContent>
    {{! Creation modal }}
    <PropertyEditorModal
      @modalOpen={{this.isCreating}}
      @onSave={{this.addProperty}}
      @onCancel={{this.cancel}}
    />
    {{! Update modal }}
    <PropertyEditorModal
      @modalOpen={{this.isUpdating}}
      @onSave={{this.updateProperty}}
      @onCancel={{this.cancel}}
      {{! @glint-expect-error check if property is defined }}
      @property={{this.status.property}}
    />
  </template>
}
