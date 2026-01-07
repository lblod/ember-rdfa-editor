import Component from '@glimmer/component';
import type SayController from '#root/core/say-controller.ts';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import { tracked } from '@glimmer/tracking';
import type { FullTriple } from '#root/core/rdfa-processor.ts';
import ExternalTripleForm from './form.gts';
import { transformExternalTriples } from '#root/utils/external-triple-utils.ts';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { BinIcon } from '@appuniversum/ember-appuniversum/components/icons/bin';
import { fn } from '@ember/helper';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import { isSome, type Option } from '#root/utils/_private/option.ts';
import WithUniqueId from '#root/components/_private/utils/with-unique-id.ts';
import { modifier } from 'ember-modifier';
import { action } from '@ember/object';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import { localCopy } from 'tracked-toolbox';

interface Sig {
  Args: {
    controller: SayController;
    node: ResolvedPNode;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
  };
}
export default class ExternalTripleEditorCard extends Component<Sig> {
  @localCopy('args.expanded', true) declare expanded: boolean;

  @tracked
  editModalOpen = false;
  @tracked
  indexBeingEdited?: number;

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  get node() {
    return this.args.node;
  }
  get externalTriples(): FullTriple[] {
    return (this.node.value.attrs['externalTriples'] as FullTriple[]) ?? [];
  }
  get controller() {
    return this.args.controller;
  }
  get tripleBeingEdited(): Option<FullTriple> {
    if (isSome(this.indexBeingEdited)) {
      return this.externalTriples[this.indexBeingEdited];
    }
    return null;
  }
  closeModal = () => {
    this.editModalOpen = false;
  };
  updateExternalTriples = (trip: FullTriple) => {
    let tr;
    if (isSome(this.indexBeingEdited)) {
      const index = this.indexBeingEdited;
      tr = transformExternalTriples((triples) => {
        const copy = [...triples];
        copy.splice(index, 1, trip);
        return copy;
      }, this.args.node.pos)(this.controller.mainEditorState).transaction;
    } else {
      tr = transformExternalTriples(
        (triples) => triples.concat(trip),
        this.args.node.pos,
      )(this.controller.mainEditorState).transaction;
    }

    this.controller.mainEditorView.dispatch(tr);

    this.closeModal();
  };
  startTripleEdit = (index?: number) => {
    this.indexBeingEdited = index;

    this.editModalOpen = true;
  };
  addTriple = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    this.startTripleEdit();
  };
  editTriple = (index: number) => {
    this.startTripleEdit(index);
  };
  removeTriple = (index: number) => {
    const tr = transformExternalTriples((triples) => {
      const clone = [...triples];
      clone.splice(index, 1);
      return clone;
    }, this.args.node.pos)(this.controller.mainEditorState).transaction;
    this.controller.mainEditorView.dispatch(tr);
  };
  <template>
    <AuCard
      @size="small"
      @expandable={{true}}
      @manualControl={{true}}
      @openSection={{this.toggleSection}}
      @isExpanded={{this.expanded}}
      @disableAuContent={{true}}
      as |c|
    >
      <c.header class="say-flex-grow">
        <AuToolbar
          class="au-u-flex au-u-flex-row au-u-flex--space-between"
          as |Group|
        >
          <Group>
            <AuHeading @level="1" @skin="6">External Triples</AuHeading>
          </Group>
          <Group>
            <AuButton @skin="link" {{on "click" this.addTriple}}>
              Add triple
            </AuButton>
          </Group>
        </AuToolbar>
      </c.header>
      <c.content class="au-c-content--tiny">
        {{#if this.externalTriples.length}}
          <AuList @divider={{true}} as |Item|>
            {{#each this.externalTriples as |trip index|}}
              <Item>
                <ExternalTripleItem
                  @trip={{trip}}
                  @index={{index}}
                  @onEdit={{this.editTriple}}
                  @onRemove={{this.removeTriple}}
                />
              </Item>
            {{/each}}
          </AuList>
        {{else}}
          <p class="au-u-italic">This document does not define any external
            triples.</p>
        {{/if}}
      </c.content>
    </AuCard>
    <EditModal
      @modalOpen={{this.editModalOpen}}
      @onCancel={{this.closeModal}}
      @onSubmit={{this.updateExternalTriples}}
      @triple={{this.tripleBeingEdited}}
    />
  </template>
}

interface EditModalSig {
  Args: {
    modalOpen: boolean;
    onCancel: () => void;
    onSubmit: (trip: FullTriple) => void;
    triple?: Option<FullTriple>;
  };
}

class EditModal extends Component<EditModalSig> {
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

  <template>
    <WithUniqueId as |formId|>
      <AuModal
        @modalOpen={{@modalOpen}}
        @closable={{true}}
        @closeModal={{@onCancel}}
        {{! @glint-expect-error appuniversum types should be adapted to accept an html element here }}
        @initialFocus={{this.initiallyFocusedElement}}
      >
        <:title>Edit external triples</:title>
        <:body>
          <ExternalTripleForm
            @initialFocus={{this.initialFocus}}
            @onSubmit={{@onSubmit}}
            id={{formId}}
            @triple={{@triple}}
            @onKeyDown={{this.onFormKeyDown}}
          />
        </:body>
        <:footer>
          <AuButtonGroup>
            <AuButton form={{formId}} type="submit">Save</AuButton>
            <AuButton
              @skin="secondary"
              {{on "click" @onCancel}}
            >Cancel</AuButton>
          </AuButtonGroup>
        </:footer>
      </AuModal>
    </WithUniqueId>
  </template>
}

interface ExternalTripleItemSig {
  Args: {
    trip: FullTriple;
    index: number;
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
  };
}
class ExternalTripleItem extends Component<ExternalTripleItemSig> {
  get datatype() {
    const trip = this.args.trip;
    if (trip.object.termType === 'Literal') {
      return trip.object.datatype.value;
    }
    return null;
  }
  get language() {
    const trip = this.args.trip;
    if (trip.object.termType === 'Literal') {
      return trip.object.language;
    }
    return null;
  }
  <template>
    <div class="au-u-padding-tiny">
      <p><strong>subject:</strong> {{@trip.subject.value}}</p>
      <p><strong>predicate:</strong> {{@trip.predicate}}</p>
      {{#if this.datatype}}
        <p><strong>datatype:</strong> {{this.datatype}}</p>
      {{/if}}
      {{#if this.language}}
        <p><strong>language:</strong> {{this.language}}</p>
      {{/if}}
      <p><strong>value:</strong> {{@trip.object.value}}</p>
    </div>

    <AuDropdown @icon={{ThreeDotsIcon}} role="menu" @alignment="left">
      <AuButton
        @skin="link"
        @icon={{PencilIcon}}
        role="menuitem"
        {{on "click" (fn @onEdit @index)}}
      >
        Edit property
      </AuButton>
      <AuButton
        @skin="link"
        @icon={{BinIcon}}
        role="menuitem"
        class="au-c-button--alert"
        {{on "click" (fn @onRemove @index)}}
      >
        Remove property
      </AuButton>
    </AuDropdown>
  </template>
}
