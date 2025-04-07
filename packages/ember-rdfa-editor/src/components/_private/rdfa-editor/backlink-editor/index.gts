import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type { IncomingTriple } from '#root/core/rdfa-processor.ts';
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
import { ExternalLinkIcon } from '@appuniversum/ember-appuniversum/components/icons/external-link';
import { selectNodeBySubject } from '#root/commands/_private/rdfa-commands/select-node-by-subject.ts';
import type { PNode } from '#root/prosemirror-aliases.ts';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import BacklinkForm from './form.gts';
import { v4 as uuidv4 } from 'uuid';
import { action } from '@ember/object';
import {
  addBacklinkToNode,
  removeBacklinkFromNode,
} from '#root/utils/rdfa-utils.ts';
import { transactionCombinator } from '#root/utils/transaction-utils.ts';
import { modifier } from 'ember-modifier';

type CreationStatus = {
  mode: 'creation';
};
type UpdateStatus = {
  mode: 'update';
  index: number;
  backlink: IncomingTriple;
};
type Status = CreationStatus | UpdateStatus;
type Args = {
  controller: SayController;
  node: ResolvedPNode;
  predicateOptions?: string[];
};
export default class BacklinkEditor extends Component<Args> {
  @tracked status?: Status;

  setUpListeners = modifier(() => {
    const listenerHandler = (event: KeyboardEvent) => {
      if (event.altKey && event.ctrlKey) {
        const key = event.key;
        switch (key) {
          case 'l':
          case 'L':
            this.startBacklinkCreation();
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

  get backlinks() {
    return this.args.node.value.attrs['backlinks'] as IncomingTriple[];
  }

  get isCreating() {
    return this.status?.mode === 'creation';
  }

  get isUpdating() {
    return this.status?.mode === 'update';
  }

  goToSubject = (subject: string) => {
    this.controller.doCommand(selectNodeBySubject({ subject }), {
      view: this.controller.mainEditorView,
    });
    this.controller.focus();
  };

  startBacklinkCreation = () => {
    this.status = {
      mode: 'creation',
    };
  };

  startBacklinkUpdate = (index: number) => {
    this.status = {
      mode: 'update',
      index,
      backlink: this.backlinks[index],
    };
  };

  addBacklink = (backlink: IncomingTriple) => {
    this.controller.withTransaction(() => {
      return addBacklinkToNode({
        rdfaId: this.node.attrs['__rdfaId'] as string,
        backlink,
      })(this.controller.mainEditorState).transaction;
    });
    this.status = undefined;
  };

  removeBacklink = (index: number) => {
    this.controller.withTransaction(() => {
      return removeBacklinkFromNode({
        rdfaId: this.node.attrs['__rdfaId'] as string,
        index,
      })(this.controller.mainEditorState).transaction;
    });
  };

  updateBacklink = (newBacklink: IncomingTriple) => {
    if (this.status?.mode === 'update') {
      const rdfaId = this.node.attrs['__rdfaId'] as string;
      const index = this.status.index;
      this.controller.withTransaction(() => {
        return transactionCombinator(this.controller.mainEditorState)([
          removeBacklinkFromNode({ rdfaId, index }),
          addBacklinkToNode({ rdfaId, backlink: newBacklink }),
        ]).transaction;
      });

      this.status = undefined;
    }
  };

  cancel = () => {
    this.status = undefined;
  };

  <template>
    <AuContent @skin="tiny" {{this.setUpListeners}}>
      <AuToolbar as |Group|>
        <Group>
          <AuHeading @level="5" @skin="5">Backlinks</AuHeading>
        </Group>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @skin="naked"
            {{on "click" this.startBacklinkCreation}}
          >
            Add backlink
          </AuButton>
        </Group>
      </AuToolbar>
      {{#if this.backlinks.length}}
        <AuList @divider={{true}} as |Item|>
          {{#each this.backlinks as |backlink index|}}
            <Item
              class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
            >
              <div class="au-u-padding-tiny">
                <AuButton
                  class="au-u-padding-left-none au-u-padding-right-none"
                  @icon={{ExternalLinkIcon}}
                  @skin="link"
                  title={{backlink.subject.value}}
                  {{on "click" (fn this.goToSubject backlink.subject.value)}}
                >subject</AuButton>
                <p><strong>predicate:</strong> {{backlink.predicate}}</p>
              </div>
              <AuDropdown @icon={{ThreeDotsIcon}} role="menu" @alignment="left">
                <AuButton
                  @skin="link"
                  @icon={{PencilIcon}}
                  role="menuitem"
                  {{on "click" (fn this.startBacklinkUpdate index)}}
                >
                  Edit backlink
                </AuButton>
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
        <p>This node doesn't have any backlinks yet.</p>
      {{/if}}
    </AuContent>
    {{! Creation modal }}
    <Modal
      @title="Add backlink"
      @controller={{@controller}}
      @modalOpen={{this.isCreating}}
      @onSave={{this.addBacklink}}
      @onCancel={{this.cancel}}
      @predicateOptions={{@predicateOptions}}
    />
    {{! Update modal }}
    <Modal
      @title="Edit backlink"
      @controller={{@controller}}
      @modalOpen={{this.isUpdating}}
      @onSave={{this.updateBacklink}}
      @onCancel={{this.cancel}}
      {{! @glint-expect-error check if backlink is defined }}
      @backlink={{this.status.backlink}}
      @predicateOptions={{@predicateOptions}}
    />
  </template>
}

interface BacklinkEditorModalSig {
  Args: {
    title: string;
    backlink?: IncomingTriple;
    controller: SayController;
    modalOpen: boolean;
    onCancel: () => unknown;
    onSave: (backlink: IncomingTriple) => unknown;
    predicateOptions?: string[];
  };
}

class Modal extends Component<BacklinkEditorModalSig> {
  @action
  cancel() {
    this.args.onCancel();
  }

  save = (backlink: IncomingTriple) => {
    this.args.onSave(backlink);
  };

  <template>
    {{! this was using unique-id but on our version of ember the exported helper seems to be undefined, so use uuid instead }}
    {{#let (uuidv4) as |formId|}}
      <AuModal
        @modalOpen={{@modalOpen}}
        @closable={{true}}
        @closeModal={{this.cancel}}
      >
        <:title>{{@title}}</:title>
        <:body>
          <BacklinkForm
            id={{formId}}
            @onSubmit={{this.save}}
            @controller={{@controller}}
            @backlink={{@backlink}}
            @predicateOptions={{@predicateOptions}}
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
    {{/let}}
  </template>
}
