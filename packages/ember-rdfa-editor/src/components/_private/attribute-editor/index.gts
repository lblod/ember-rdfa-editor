import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { localCopy } from 'tracked-toolbox';
import { HeadlessForm, type FormData } from 'ember-headless-form';
import type { HeadlessFormFieldComponentSignature } from 'ember-headless-form/-private/components/field';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { and } from 'ember-truth-helpers';
import type { Attrs } from 'prosemirror-model';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuTextarea from '@appuniversum/ember-appuniversum/components/au-textarea';
import SayController from '#root/core/say-controller.ts';
import type SayNodeSpec from '#root/core/say-node-spec.ts';
import TransformUtils from '#root/utils/_private/transform-utils.ts';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import {
  transactionCombinator,
  type TransactionMonad,
} from '#root/utils/transaction-utils.ts';
import WithUniqueId from '#root/components/_private/utils/with-unique-id.ts';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';

type Signature = {
  Args: {
    controller: SayController;
    node: ResolvedPNode;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
  };
};
export type AttributeEditHandler = (
  pos: number,
  value: string,
) => TransactionMonad<boolean>;

export default class AttributeEditor extends Component<Signature> {
  @localCopy('args.expanded', true) declare expanded: boolean;
  @tracked isEditing = false;

  get node() {
    return this.args.node;
  }
  get nodeAttrs() {
    return this.node.value.attrs;
  }
  get nodespec() {
    return this.node.value.type.spec as SayNodeSpec;
  }

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  isEditable = (attr: string): boolean | undefined => {
    return this.nodespec.attrs?.[attr].editable;
  };

  setAttrMonad =
    (key: string) =>
    (pos: number, value: string): TransactionMonad<boolean> =>
    (state) => {
      const tr = state.tr;
      TransformUtils.setAttribute(tr, pos, key, value);
      return { transaction: tr, initialState: state, result: true };
    };

  getHandler = (attr: string): AttributeEditHandler | null => {
    if (this.isEditable(attr)) {
      //@ts-expect-error handler is not defined on attribute-spec type
      const handler = this.node.value.type.spec.attrs[attr].editHandler as
        | AttributeEditHandler
        | undefined;
      if (handler) {
        return handler;
      } else {
        return this.setAttrMonad(attr);
      }
    }
    return null;
  };

  enableEditingMode = () => {
    this.isEditing = true;
  };
  cancelEditing = (formReset: () => void) => {
    this.isEditing = false;
    formReset();
  };

  setField = (
    field: HeadlessFormFieldComponentSignature<Attrs>['Blocks']['default'][0],
    value: Event,
  ) => {
    const newVal = (value.target as HTMLTextAreaElement).value;
    field.setValue(newVal);
  };

  saveChanges = (newAttrs: FormData<Attrs>) => {
    this.args.controller?.withTransaction(() => {
      const monads: TransactionMonad<boolean>[] = [];
      for (const key in newAttrs) {
        if (newAttrs[key] !== this.nodeAttrs[key]) {
          const handler = this.getHandler(key);
          if (handler) {
            monads.push(handler(this.node.pos, newAttrs[key] as string));
          }
        }
      }
      return transactionCombinator(this.args.controller.mainEditorState)(monads)
        .transaction;
    });
    this.isEditing = false;
  };

  formatValue = (value: unknown) => {
    return JSON.stringify(value, null, 2);
  };

  editorComponent = (attr: string) => {
    return this.nodespec?.attrs?.[attr].editor;
  };

  <template>
    <WithUniqueId as |formId|>
      <HeadlessForm
        id={{formId}}
        @data={{this.nodeAttrs}}
        @onSubmit={{this.saveChanges}}
        as |form|
      >
        <AuCard
          @flex={{true}}
          @size="small"
          @expandable={{true}}
          @manualControl={{true}}
          @openSection={{this.toggleSection}}
          @isExpanded={{this.expanded}}
          as |c|
        >
          <c.header>
            <AuHeading @level="1" @skin="6">Node attributes</AuHeading>
          </c.header>
          <c.content class="au-c-content--tiny">
            <AuToolbar @border="bottom" as |Group|>
              <Group>
                <AuButtonGroup>
                  {{#if this.isEditing}}
                    <AuButton
                      @skin="naked"
                      @iconAlignment="right"
                      {{on "click" (fn this.cancelEditing form.reset)}}
                    >
                      Cancel
                    </AuButton>
                    <AuButton
                      type="submit"
                      @icon={{CheckIcon}}
                      @iconAlignment="right"
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
                </AuButtonGroup>
              </Group>
            </AuToolbar>
            <AuList @divider={{true}} as |Item|>
              {{#each-in this.nodeAttrs as |key value|}}
                <Item>
                  <div class="au-u-padding-tiny">
                    {{#if (and this.isEditing (this.isEditable key))}}
                      <form.Field @name={{key}} as |field|>
                        <AuLabel for={{field.id}}>
                          {{key}}
                        </AuLabel>
                        {{#let (this.editorComponent key) as |EditorComponent|}}
                          {{#if EditorComponent}}
                            {{! @glint-expect-error fix types of dynamic element }}
                            <EditorComponent
                              id={{field.id}}
                              value={{field.value}}
                              name={{key}}
                              {{! @glint-expect-error glint has no Signature for the component}}
                              {{on "change" (fn this.setField field)}}
                            />
                          {{else}}
                            <AuTextarea
                              @width="block"
                              id={{field.id}}
                              value={{field.value}}
                              name={{key}}
                              {{on "change" (fn this.setField field)}}
                            />
                          {{/if}}
                        {{/let}}
                      </form.Field>
                    {{else}}
                      <p><strong>{{key}}</strong></p>
                      <pre class="say-attribute-editor__formatted-content">{{if
                          value
                          (this.formatValue value)
                          "<No value>"
                        }}</pre>
                    {{/if}}
                  </div>
                </Item>
              {{/each-in}}
            </AuList>
          </c.content>
        </AuCard>
      </HeadlessForm>
    </WithUniqueId>
  </template>
}
