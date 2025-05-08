import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuModal, {
  type AuModalSignature,
} from '@appuniversum/ember-appuniversum/components/au-modal';
import Component from '@glimmer/component';
import WithUniqueId from '../with-unique-id.ts';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import type { SayTerm } from '#root/core/say-data-factory/term.ts';
import { TrackedObject } from 'tracked-built-ins';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { CommentIcon } from '@appuniversum/ember-appuniversum/components/icons/comment';
import { QuestionCircleIcon } from '@appuniversum/ember-appuniversum/components/icons/question-circle';
import { not } from 'ember-truth-helpers';
import AuBadge from '@appuniversum/ember-appuniversum/components/au-badge';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import type { SayNamedNode } from '#root/core/say-data-factory/named-node.ts';
import {
  sayDataFactory,
  type ResourceNodeTerm,
} from '#root/core/say-data-factory/index.ts';
import { HeadlessForm } from 'ember-headless-form';
import { fn } from '@ember/helper';
import * as yup from 'yup';
import { validateYup } from 'ember-headless-form-yup';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { get } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { unwrap } from '#root/utils/_private/option.ts';
import { action } from '@ember/object';

type TermOptionGeneratorResult<TermType extends SayTerm> =
  | TermOption<TermType>[]
  | Promise<TermOption<TermType>[]>;

type PredicateOptionGeneratorResult =
  | PredicateOption[]
  | Promise<PredicateOption[]>;

type PredicateOptionGeneratorArgs = {
  selectedObject?: SayTerm;
  searchString?: string;
};

export type PredicateOptionGenerator = (
  args?: PredicateOptionGeneratorArgs,
) => PredicateOptionGeneratorResult;

type TargetOptionGeneratorArgs = {
  selectedObject?: SayTerm;
  selectedPredicate?: SayTerm;
  searchString?: string;
};

export type TargetOptionGenerator = (
  args?: TargetOptionGeneratorArgs,
) => TermOptionGeneratorResult<ResourceNodeTerm>;

export type SubmissionBody = {
  target: TermOption<ResourceNodeTerm>;
  predicate: PredicateOption;
};

type LinkRdfaNodeModalSig = {
  Element: AuModalSignature['Element'];
  Args: {
    selectedObject: SayTerm;
    onSubmit: (body: SubmissionBody) => unknown;
    onCancel: () => unknown;
    predicateOptionGenerator: PredicateOptionGenerator;
    subjectOptionGenerator: TargetOptionGenerator;
    objectOptionGenerator: TargetOptionGenerator;
    devMode?: boolean;
  };
};

export type TermOption<TermType extends SayTerm> = {
  label?: string;
  description?: string;
  term: TermType;
};

export type PredicateOption = TermOption<SayNamedNode> & {
  direction: 'backlink' | 'property';
};

type FormData = {
  predicate?: PredicateOption;
  target?: TermOption<ResourceNodeTerm>;
};

const formSchema = yup.object({
  predicate: yup
    .object()
    .required(
      'ember-rdfa-editor.linking-ui-poc.modal.form.fields.predicate.validation.required',
    ),
  target: yup
    .object()
    .required(
      'ember-rdfa-editor.linking-ui-poc.modal.form.fields.target.validation.required',
    ),
});

export default class LinkRdfaNodeModal extends Component<LinkRdfaNodeModalSig> {
  data: FormData = new TrackedObject({});

  get devMode() {
    return this.args.devMode;
  }

  resetForm?: () => void;
  assignResetForm = (resetFn: () => void) => {
    this.resetForm = resetFn;
  };

  onSubmit = (data: Required<FormData>) => {
    this.args.onSubmit({
      target: data.target,
      predicate: data.predicate,
    });
  };

  onCancel = () => {
    this.resetForm?.();
    this.args.onCancel();
  };

  setPredicate = (validationFn: () => void, option: PredicateOption) => {
    this.data.predicate = option;
    validationFn();
  };

  setTarget = (
    validationFn: () => void,
    option: TermOption<ResourceNodeTerm>,
  ) => {
    this.data.target = option;
    validationFn();
  };

  searchPredicates = async (searchString: string) => {
    const options = await this.args.predicateOptionGenerator({
      searchString,
      selectedObject: this.args.selectedObject,
    });
    return options;
  };

  searchTargets = async (searchString: string) => {
    const generatorFunction =
      this.data.predicate?.direction === 'property'
        ? this.args.objectOptionGenerator
        : this.args.subjectOptionGenerator;
    const options = await generatorFunction({
      searchString,
      selectedPredicate: this.data.predicate?.term,
      selectedObject: this.args.selectedObject,
    });
    return options;
  };

  @action
  onPowerSelectKeydown(select: Select, event: KeyboardEvent) {
    if (!this.devMode) {
      return;
    }
    // Based on example from ember-power-select docs, allows for selecting a previously non-existent
    // entry by typing in the power-select 'search' and hitting 'enter'
    if (
      event.key === 'Enter' &&
      select.isOpen &&
      !select.highlighted &&
      !!select.searchText
    ) {
      select.actions.choose({
        term: sayDataFactory.resourceNode(select.searchText),
      });
      return false;
    }
    return;
  }

  optionLabel = (option: TermOption<SayTerm>) => {
    if (this.devMode) {
      const prefix = option.term.value;
      const suffix = option.label ? ` (${option.label})` : '';
      return prefix + suffix;
    } else {
      return option.label ?? option.term.value;
    }
  };

  <template>
    <WithUniqueId as |formId|>
      <AuModal @modalOpen={{true}} @closeModal={{this.onCancel}} ...attributes>
        <:title>{{t "ember-rdfa-editor.linking-ui-poc.modal.title"}}</:title>

        <:body>
          <HeadlessForm
            id={{formId}}
            @data={{this.data}}
            @dataMode="mutable"
            @onSubmit={{this.onSubmit}}
            @validate={{validateYup formSchema}}
            class="au-c-form"
            as |form|
          >
            {{this.assignResetForm form.reset}}
            <form.Field @name="predicate" as |field|>
              <AuFormRow>
                <AuLabel
                  for={{field.id}}
                  @required={{true}}
                  @requiredLabel={{t "ember-rdfa-editor.utils.required"}}
                >
                  {{t
                    "ember-rdfa-editor.linking-ui-poc.modal.form.fields.predicate.label"
                  }}
                  <AuBadge
                    @icon={{QuestionCircleIcon}}
                    @size="small"
                    class="au-u-margin-left-tiny"
                  />
                </AuLabel>
                <PowerSelect
                  id={{field.id}}
                  @selected={{field.value}}
                  @onChange={{fn this.setPredicate field.triggerValidation}}
                  @allowClear={{true}}
                  @onKeydown={{this.onPowerSelectKeydown}}
                  @options={{this.searchPredicates ""}}
                  @search={{this.searchPredicates}}
                  @searchEnabled={{true}}
                  class="au-u-1-1"
                  as |option|
                >
                  <div
                    class="au-u-flex au-u-flex--spaced-tiny au-u-flex--vertical-center"
                  >
                    <AuIcon @icon={{CommentIcon}} />
                    <p><strong>{{this.optionLabel option}}</strong></p>
                  </div>
                  {{#if option.description}}
                    <p>{{option.description}}</p>
                  {{/if}}
                </PowerSelect>
                <field.Errors class="au-u-1-1 au-u-margin-top-tiny" as |errors|>
                  <AuAlert
                    class="au-u-margin-none"
                    @skin="warning"
                    @size="small"
                    @icon="alert-triangle"
                  >
                    {{#let (get errors 0) as |error|}}
                      {{t (unwrap error.message)}}
                    {{/let}}
                  </AuAlert>
                </field.Errors>
              </AuFormRow>
            </form.Field>
            <form.Field @name="target" as |field|>
              <AuFormRow>
                <AuLabel
                  for={{field.id}}
                  @required={{true}}
                  @requiredLabel={{t "ember-rdfa-editor.utils.required"}}
                >
                  {{t
                    "ember-rdfa-editor.linking-ui-poc.modal.form.fields.target.label"
                  }}
                  <AuBadge
                    @icon={{QuestionCircleIcon}}
                    @size="small"
                    class="au-u-margin-left-tiny"
                  />
                </AuLabel>
                <PowerSelect
                  id={{field.id}}
                  @selected={{field.value}}
                  @onChange={{fn this.setTarget field.triggerValidation}}
                  @allowClear={{true}}
                  @disabled={{not this.data.predicate}}
                  @options={{this.searchTargets ""}}
                  @search={{this.searchTargets}}
                  @searchEnabled={{true}}
                  @onKeydown={{this.onPowerSelectKeydown}}
                  class="au-u-1-1"
                  as |option|
                >
                  <div
                    class="au-u-flex au-u-flex--spaced-tiny au-u-flex--vertical-center"
                  >
                    <AuIcon @icon={{CommentIcon}} />
                    <p><strong>{{this.optionLabel option}}</strong></p>
                  </div>
                  {{#if option.description}}
                    <p>{{option.description}}</p>
                  {{/if}}
                </PowerSelect>
                <field.Errors class="au-u-1-1 au-u-margin-top-tiny" as |errors|>
                  <AuAlert
                    class="au-u-margin-none"
                    @skin="warning"
                    @size="small"
                    @icon="alert-triangle"
                  >
                    {{#let (get errors 0) as |error|}}
                      {{t (unwrap error.message)}}
                    {{/let}}
                  </AuAlert>
                </field.Errors>
              </AuFormRow>
            </form.Field>
            <AuButtonGroup>
              <AuButton form={{formId}} type="submit">{{t
                  "ember-rdfa-editor.linking-ui-poc.modal.form.submit.label"
                }}</AuButton>
              <AuButton @skin="secondary" {{on "click" this.onCancel}}>{{t
                  "ember-rdfa-editor.linking-ui-poc.modal.form.cancel.label"
                }}</AuButton>
            </AuButtonGroup>
          </HeadlessForm>
        </:body>
      </AuModal>
    </WithUniqueId>
  </template>
}
