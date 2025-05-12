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
import {
  addBacklinkToNode,
  removeBacklinkFromNode,
} from '#root/utils/rdfa-utils.ts';
import { transactionCombinator } from '#root/utils/transaction-utils.ts';
import type { Option } from '#root/utils/_private/option.ts';
import { and, not } from 'ember-truth-helpers';
import { modifier } from 'ember-modifier';
import RelationshipEditorDevModal, {
  type FormData,
} from '../relationship-editor/modal-dev-mode.gts';
import { isRdfaAttrs } from '#root/core/rdfa-types.ts';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';
import type {
  ObjectOptionGenerator,
  PredicateOptionGenerator,
  SubjectOptionGenerator,
  SubmissionBody,
} from '../relationship-editor/types.ts';

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
  predicateOptionGenerator?: PredicateOptionGenerator;
  subjectOptionGenerator?: SubjectOptionGenerator;
  objectOptionGenerator?: ObjectOptionGenerator;
};
export default class BacklinkEditor extends Component<Args> {
  @tracked status?: Status;

  setUpListeners = modifier(() => {
    const listenerHandler = (event: KeyboardEvent) => {
      if (event.altKey && event.ctrlKey) {
        const key = event.key;
        switch (key) {
          case 'b':
          case 'B':
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

  get canAddBacklink() {
    const attrs = this.node.attrs;
    const rdfaNodeType = attrs['rdfaNodeType'] as Option<string>;
    return rdfaNodeType === 'resource' || rdfaNodeType === 'literal';
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

  addBacklink = (data: SubmissionBody) => {
    const backlink: IncomingTriple = {
      predicate: data.predicate.term.value,
      // @ts-expect-error fix term types
      subject: data.target.term,
    };
    this.controller.withTransaction(
      () => {
        return addBacklinkToNode({
          rdfaId: this.node.attrs['__rdfaId'] as string,
          backlink,
        })(this.controller.mainEditorState).transaction;
      },
      { view: this.controller.mainEditorView },
    );
    this.status = undefined;
  };

  removeBacklink = (index: number) => {
    this.controller.withTransaction(
      () => {
        return removeBacklinkFromNode({
          rdfaId: this.node.attrs['__rdfaId'] as string,
          index,
        })(this.controller.mainEditorState).transaction;
      },
      { view: this.controller.mainEditorView },
    );
  };

  updateBacklink = (data: SubmissionBody) => {
    if (this.status?.mode === 'update') {
      const newBacklink: IncomingTriple = {
        predicate: data.predicate.term.value,
        // @ts-expect-error fix term types
        subject: data.target.term,
      };
      const rdfaId = this.node.attrs['__rdfaId'] as string;
      const index = this.status.index;
      this.controller.withTransaction(
        () => {
          return transactionCombinator(this.controller.mainEditorState)([
            removeBacklinkFromNode({ rdfaId, index }),
            addBacklinkToNode({ rdfaId, backlink: newBacklink }),
          ]).transaction;
        },
        { view: this.controller.mainEditorView },
      );

      this.status = undefined;
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

  get currentTerm() {
    const attrs = this.args.node.value.attrs;
    if (!isRdfaAttrs(attrs)) {
      return;
    }

    if (attrs.rdfaNodeType === 'resource') {
      return sayDataFactory.resourceNode(attrs.subject);
    } else {
      return sayDataFactory.literalNode(attrs.__rdfaId);
    }
  }

  get initialFormData(): FormData | undefined {
    if (!this.status) {
      return;
    }
    if (this.status.mode === 'update') {
      return {
        direction: 'backlink',
        predicate: {
          term: sayDataFactory.namedNode(this.status.backlink.predicate),
          direction: 'backlink',
        },
        target: {
          term: this.status.backlink.subject,
        },
      };
    } else {
      return {
        direction: 'backlink',
      };
    }
  }

  <template>
    <AuContent @skin="tiny" {{this.setUpListeners}}>
      <AuToolbar as |Group|>
        <Group>
          <AuHeading @level="6" @skin="6">Backlinks</AuHeading>
        </Group>
        <Group>
          <AuButton
            @icon={{PlusIcon}}
            @disabled={{not this.canAddBacklink}}
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
    {{#if (and this.status this.currentTerm)}}
      <RelationshipEditorDevModal
        @title={{this.modalTitle}}
        @initialData={{this.initialFormData}}
        {{! @glint-expect-error }}
        @source={{this.currentTerm}}
        @subjectOptionGenerator={{@subjectOptionGenerator}}
        @predicateOptionGenerator={{@predicateOptionGenerator}}
        @objectOptionGenerator={{@objectOptionGenerator}}
        @onSubmit={{if this.isCreating this.addBacklink this.updateBacklink}}
        @onCancel={{this.cancel}}
      />
    {{/if}}
  </template>
}
