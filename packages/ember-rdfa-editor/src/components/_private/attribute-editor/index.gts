import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import SayController from '#root/core/say-controller.ts';
import type SayNodeSpec from '#root/core/say-node-spec.ts';
import { unwrap } from '#root/utils/_private/option.ts';
import TransformUtils from '#root/utils/_private/transform-utils.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type { EmberChangeset } from 'ember-changeset';
import { Changeset } from 'ember-changeset';
import { localCopy, trackedReset } from 'tracked-toolbox';
import { TypeAssertionError } from '#root/utils/_private/errors.ts';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { ChevronUpIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-up';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import { on } from '@ember/modifier';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import { and } from 'ember-truth-helpers';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuPanel from '@appuniversum/ember-appuniversum/components/au-panel';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuTextarea from '@appuniversum/ember-appuniversum/components/au-textarea';

import WithUniqueId from '../with-unique-id.ts';

import { get } from '@ember/object';
import { fn } from '@ember/helper';
import { updateSubject } from '#root/plugins/rdfa-info/utils.ts';
import {
  transactionCombinator,
  type TransactionMonad,
} from '#root/utils/transaction-utils.ts';

type Signature = {
  Args: {
    controller: SayController;
    node: ResolvedPNode;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
  };
};
export default class AttributeEditor extends Component<Signature> {
  @localCopy('args.expanded', true) declare expanded: boolean;

  @trackedReset<AttributeEditor, boolean>({
    memo: 'node',
    update: (component) => {
      component.changeset = undefined;
      return false;
    },
  })
  isEditing = false;

  @tracked changeset?: EmberChangeset;

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  get nodespec() {
    return this.node.value.type.spec as SayNodeSpec;
  }

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  isEditable = (attr: string) => {
    //@ts-expect-error editable is not defined on attribute-spec type
    return this.node.value.type.spec.attrs[attr].editable as
      | boolean
      | undefined;
  };

  enableEditingMode = () => {
    this.changeset = Changeset(this.node.value.attrs);
    this.isEditing = true;
  };

  cancelEditing = () => {
    this.isEditing = false;
    this.changeset = undefined;
  };

  saveChanges = () => {
    this.controller?.withTransaction((tr) => {
      const setAttr =
        (key: string, value: string): TransactionMonad<boolean> =>
        (state) => {
          const tr = state.tr;
          TransformUtils.setAttribute(tr, this.node.pos, key, value);
          return { transaction: tr, initialState: state, result: true };
        };
      const monads: TransactionMonad<boolean>[] = [];
      for (const change of unwrap(this.changeset).changes) {
        const { key, value } = change;
        if (!(typeof key === 'string')) {
          throw new TypeAssertionError();
        }

        if (key === 'subject') {
          monads.push(
            updateSubject({
              pos: this.node.pos,
              targetSubject: value as string,
              keepBacklinks: true,
              keepExternalTriples: true,
              keepProperties: true,
            }),
          );
        } else {
          monads.push(setAttr(key, value as string));
        }
      }
      return transactionCombinator(this.controller.mainEditorState)(monads)
        .transaction;
    });
    this.isEditing = false;
    this.changeset = undefined;
  };

  updateChangeset = (attr: string, event: InputEvent) => {
    if (this.changeset) {
      this.changeset[attr] = (event.target as HTMLTextAreaElement).value;
    }
  };

  formatValue = (value: unknown) => {
    return JSON.stringify(value, null, 2);
  };

  editorComponent = (attr: string) => {
    return this.nodespec?.attrs?.[attr].editor;
  };

  <template>
    <AuPanel class="au-u-margin-bottom-tiny" as |Section|>
      <Section>
        <AuToolbar as |Group|>
          <Group>
            <AuHeading @level="5" @skin="5">Node attributes</AuHeading>
          </Group>
          <Group>
            <AuButtonGroup>
              {{#if this.isEditing}}
                <AuButton
                  @skin="naked"
                  @iconAlignment="right"
                  {{on "click" this.cancelEditing}}
                >
                  Cancel
                </AuButton>
                <AuButton
                  @icon={{CheckIcon}}
                  @iconAlignment="right"
                  {{on "click" this.saveChanges}}
                >
                  Save
                </AuButton>
              {{else}}
                <AuButton
                  @skin="naked"
                  @icon={{PencilIcon}}
                  @iconAlignment="right"
                  {{on "click" this.enableEditingMode}}
                >
                  Edit
                </AuButton>
              {{/if}}
              <AuButton
                @skin="naked"
                @icon={{if this.expanded ChevronUpIcon ChevronDownIcon}}
                {{on "click" this.toggleSection}}
              />
            </AuButtonGroup>
          </Group>
        </AuToolbar>
      </Section>
      {{#if this.expanded}}
        <Section>
          <AuList @divider={{true}} as |Item|>
            {{#each-in this.node.value.attrs as |key value|}}
              <Item>
                <div class="au-u-padding-tiny">
                  {{#if (and this.isEditing (this.isEditable key))}}
                    <WithUniqueId as |id|>
                      <AuLabel for={{id}}>
                        {{key}}
                      </AuLabel>
                      {{#let (this.editorComponent key) as |EditorComponent|}}
                        {{#if EditorComponent}}
                          {{! @glint-expect-error fix types of dynamic element }}
                          <EditorComponent
                            id={{id}}
                            value={{get this.changeset key}}
                            {{! @glint-expect-error fix changeset types }}
                            {{on "change" (fn this.updateChangeset key)}}
                          />
                        {{else}}
                          <AuTextarea
                            @width="block"
                            id={{id}}
                            {{! @glint-expect-error fix changeset types }}
                            value={{get this.changeset key}}
                            {{on "change" (fn this.updateChangeset key)}}
                          />
                        {{/if}}
                      {{/let}}
                    </WithUniqueId>
                  {{else}}
                    <p><strong>{{key}}</strong></p>
                    <pre>{{if
                        value
                        (this.formatValue value)
                        "<No value>"
                      }}</pre>
                  {{/if}}
                </div>
              </Item>
            {{/each-in}}
          </AuList>
        </Section>
      {{/if}}
    </AuPanel>
  </template>
}
