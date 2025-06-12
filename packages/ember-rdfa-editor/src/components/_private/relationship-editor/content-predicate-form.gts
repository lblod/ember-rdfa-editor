import { LANG_STRING } from '#root/utils/_private/constants.ts';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { HeadlessForm } from 'ember-headless-form';
import { validateYup } from 'ember-headless-form-yup';
import { TrackedObject } from 'tracked-built-ins';
import { trackedReset } from 'tracked-toolbox';
import type { InferType } from 'yup';
import * as yup from 'yup';

function truthy(obj: unknown) {
  return !!obj;
}

const formSchema = yup.object({
  contentPredicate: yup.string().optional(),
  datatype: yup.string().optional(),
  language: yup.string().optional(),
});

type FormData = InferType<typeof formSchema>;

export type SubmissionBody = FormData;

type Signature = {
  Args: {
    initialFormData?: FormData;
    onSubmit: (body: SubmissionBody) => unknown;
  };
  Element: HTMLFormElement;
};

export default class ContentPredicateForm extends Component<Signature> {
  @trackedReset('args.initialFormData') formData = new TrackedObject(
    this.args.initialFormData ?? {},
  );

  handleSubmit = (body: SubmissionBody) => {
    this.args.onSubmit(body);
  };

  setPredicate = (validationFn: () => void, event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    this.formData.contentPredicate = value;
    validationFn();
  };

  setDatatype = (validationFn: () => void, event: Event) => {
    const datatype = (event.target as HTMLInputElement).value;
    this.formData.datatype = datatype;
    validationFn();
  };

  setLanguage = (validationFn: () => void, event: Event) => {
    const language = (event.target as HTMLInputElement).value;
    this.formData.language = language;
    this.formData.datatype = LANG_STRING;
    validationFn();
  };

  <template>
    <HeadlessForm
      class="au-u-flex au-u-flex--column au-u-flex--spaced-tiny"
      @onSubmit={{this.handleSubmit}}
      @data={{this.formData}}
      @dataMode="mutable"
      @validate={{validateYup formSchema}}
      ...attributes
      as |form|
    >
      <AuFormRow>
        <form.Field @name="contentPredicate" as |field|>
          <AuLabel class="au-u-hidden-visually" for={{field.id}}>
            Content Predicate
          </AuLabel>
          <AuInput
            @width="block"
            id={{field.id}}
            value={{field.value}}
            name="contentPredicate"
            {{on "change" (fn this.setPredicate field.triggerValidation)}}
          />
          <field.Errors />
        </form.Field>
      </AuFormRow>
      <div class="au-u-flex au-u-flex--row au-u-flex--spaced-tiny">
        <form.Field @name="language" as |field|>
          <div class="au-u-1-5 au-u-flex au-u-flex--column">
            <AuLabel
              class="au-u-para-small au-u-muted"
              for={{field.id}}
            >Language</AuLabel>
            <AuInput
              id={{field.id}}
              {{on "input" (fn this.setLanguage field.triggerValidation)}}
              value={{field.value}}
            />
          </div>
        </form.Field>
        <form.Field @name="datatype" as |field|>
          <div class="au-u-4-5 au-u-flex au-u-flex--column">
            <AuLabel
              class="au-u-para-small au-u-muted"
              for={{field.id}}
            >Datatype</AuLabel>
            <AuInput
              id={{field.id}}
              @disabled={{truthy this.formData.language}}
              {{on "input" (fn this.setDatatype field.triggerValidation)}}
              value={{field.value}}
            />
          </div>
        </form.Field>
      </div>

    </HeadlessForm>
  </template>
}
