import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { HeadlessForm } from 'ember-headless-form';
import { validateYup } from 'ember-headless-form-yup';
import type { HeadlessFormFieldComponentSignature } from 'ember-headless-form/-private/components/field';
import { localCopy } from 'tracked-toolbox';
import * as yup from 'yup';

export type SubmissionBody = {
  contentPredicate?: string;
};

const formSchema = yup.object({
  contentPredicate: yup.string().optional(),
});

type FormData = SubmissionBody;

type Signature = {
  Args: {
    initialFormData?: FormData;
    onSubmit: (body: SubmissionBody) => unknown;
  };
  Element: HTMLFormElement;
};

export default class ContentPredicateForm extends Component<Signature> {
  @localCopy('args.initialFormData') formData?: FormData;

  handleSubmit = (body: SubmissionBody) => {
    this.args.onSubmit(body);
  };

  setField = (
    field: HeadlessFormFieldComponentSignature<FormData>['Blocks']['default'][0],
    event: Event,
  ) => {
    const newVal = (event.target as HTMLInputElement).value;
    field.setValue(newVal);
  };

  <template>
    <HeadlessForm
      @onSubmit={{this.handleSubmit}}
      @data={{this.formData}}
      @validate={{validateYup formSchema}}
      ...attributes
      as |form|
    >
      <form.Field @name="contentPredicate" as |field|>
        <AuLabel class="au-u-hidden-visually" for={{field.id}}>
          Content Predicate
        </AuLabel>
        <AuInput
          @width="block"
          id={{field.id}}
          value={{field.value}}
          name="contentPredicate"
          {{on "change" (fn this.setField field)}}
        />
        <field.Errors />
      </form.Field>
    </HeadlessForm>
  </template>
}
