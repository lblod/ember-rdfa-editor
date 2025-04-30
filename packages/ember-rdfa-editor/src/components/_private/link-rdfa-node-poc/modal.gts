import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuModal, {
  type AuModalSignature,
} from '@appuniversum/ember-appuniversum/components/au-modal';
import Component from '@glimmer/component';
import WithUniqueId from '../with-unique-id.ts';
import PowerSelect from 'ember-power-select/components/power-select';
import type { SayTerm } from '#root/core/say-data-factory/term.ts';
import { TrackedObject } from 'tracked-built-ins';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import { CommentIcon } from '@appuniversum/ember-appuniversum/components/icons/comment';
import { QuestionCircleIcon } from '@appuniversum/ember-appuniversum/components/icons/question-circle';
import { not, or } from 'ember-truth-helpers';
import AuBadge from '@appuniversum/ember-appuniversum/components/au-badge';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import type { SayNamedNode } from '#root/core/say-data-factory/named-node.ts';
import type { ResourceNodeTerm } from '#root/core/say-data-factory/index.ts';
import { HeadlessForm } from 'ember-headless-form';
import { fn } from '@ember/helper';
import * as yup from 'yup';
import { validateYup } from 'ember-headless-form-yup';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { get } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { unwrap } from '#root/utils/_private/option.ts';

type TermOptionGeneratorResult<TermType extends SayTerm> =
  | TermOption<TermType>[]
  | Promise<TermOption<TermType>[]>;

type PredicateOptionGeneratorArgs = {
  selectedObject?: SayTerm;
  searchString?: string;
};

export type PredicateOptionGenerator = (
  args?: PredicateOptionGeneratorArgs,
) => TermOptionGeneratorResult<SayNamedNode>;

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
  predicate: TermOption<SayNamedNode>;
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
  };
};

export type TermOption<TermType extends SayTerm> = {
  label?: string;
  description?: string;
  term: TermType;
  inverse?: boolean;
};

type FormData = {
  predicate?: TermOption<SayNamedNode>;
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
      'ember-rdfa-editor.linking-ui-poc.modal.form.fields.subject.validation.required',
    ),
});

export default class LinkRdfaNodeModal extends Component<LinkRdfaNodeModalSig> {
  data: FormData = new TrackedObject({});

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

  setPredicate = (
    validationFn: () => void,
    option: TermOption<SayNamedNode>,
  ) => {
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
    console.log('hi');
    console.log(this.data.predicate);
    const generatorFunction = this.data.predicate?.inverse
      ? this.args.objectOptionGenerator
      : this.args.subjectOptionGenerator;
    const options = await generatorFunction({
      searchString,
      selectedPredicate: this.data.predicate?.term,
      selectedObject: this.args.selectedObject,
    });
    return options;
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
                    <p><strong>{{or
                          option.label
                          option.term.value
                        }}</strong></p>
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
                  class="au-u-1-1"
                  as |option|
                >
                  <div
                    class="au-u-flex au-u-flex--spaced-tiny au-u-flex--vertical-center"
                  >
                    <AuIcon @icon={{CommentIcon}} />
                    <p><strong>{{or
                          option.label
                          option.term.value
                        }}</strong></p>
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
