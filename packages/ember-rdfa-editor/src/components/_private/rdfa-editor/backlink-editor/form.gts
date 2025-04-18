import Component from '@glimmer/component';
import type { IncomingTriple } from '#root/core/rdfa-processor.ts';
import { trackedReset } from 'tracked-toolbox';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import { sayDataFactory } from '#root/core/say-data-factory/index.ts';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import { type Option } from '#root/utils/_private/option.ts';
import { action, get } from '@ember/object';
import type SayController from '#root/core/say-controller.ts';
import { getSubjects } from '#root/plugins/rdfa-info/index.ts';
import type { ModifierLike } from '@glint/template';
import { modifier } from 'ember-modifier';
import * as yup from 'yup';
import { validateYup } from 'ember-headless-form-yup';
import { TrackedObject } from 'tracked-built-ins';
import { HeadlessForm } from 'ember-headless-form';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';

interface BacklinkFormSig {
  Element: HTMLFormElement;
  Args: {
    initialFocus?: ModifierLike<{ Element: HTMLElement }>;
    controller: SayController;
    onKeyDown?: (
      form: HTMLFormElement,
      event: KeyboardEvent,
    ) => boolean | undefined;
    onSubmit: (backlink: IncomingTriple) => void;
    backlink?: Option<IncomingTriple>;
    predicateOptions?: string[];
  };
}
const DEFAULT_BACKLINK: IncomingTriple = {
  subject: sayDataFactory.resourceNode(''),
  predicate: '',
};

const formSchema = yup.object({
  subject: yup.string().required().curie(),
  predicate: yup.string().required().curie(),
});

type FormData = {
  subject: string;
  predicate: string;
};

export default class BacklinkForm extends Component<BacklinkFormSig> {
  formElement?: HTMLFormElement;
  setupFormElement = modifier((element: HTMLFormElement) => {
    this.formElement = element;
    const keyDownHandler = (event: KeyboardEvent) => {
      if (this.args.onKeyDown) {
        this.args.onKeyDown(element, event);
      }
    };
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  });

  get initialFormData(): FormData {
    return {
      subject: this.backlink.subject.value,
      predicate: this.backlink.predicate,
    };
  }

  @trackedReset('initialFormData') formData = new TrackedObject(
    this.initialFormData,
  );

  get controller() {
    return this.args.controller;
  }

  get subjectOptions(): string[] {
    return getSubjects(this.controller.mainEditorState);
  }

  get backlink() {
    return this.args.backlink ?? DEFAULT_BACKLINK;
  }

  @action
  updateField<F extends keyof FormData>(
    validateFn: () => void,
    updateFn: (value: FormData[F]) => void,
  ) {
    return (value: FormData[F]) => {
      updateFn(value);
      validateFn();
    };
  }

  @action
  onPowerSelectKeydown(select: Select, event: KeyboardEvent) {
    if (this.formElement && this.args.onKeyDown) {
      this.args.onKeyDown(this.formElement, event);
    }
    // Based on example from ember-power-select docs, allows for selecting a previously non-existent
    // entry by typing in the power-select 'search' and hitting 'enter'
    if (
      event.key === 'Enter' &&
      select.isOpen &&
      !select.highlighted &&
      !!select.searchText
    ) {
      select.actions.choose(select.searchText);
      return false;
    }
    return;
  }

  handleSubmit = (formData: FormData) => {
    const backlink: IncomingTriple = {
      subject: sayDataFactory.resourceNode(formData.subject),
      predicate: formData.predicate,
    };
    this.args.onSubmit(backlink);
  };

  <template>
    <HeadlessForm
      @data={{this.formData}}
      @dataMode="mutable"
      @onSubmit={{this.handleSubmit}}
      @validate={{validateYup formSchema}}
      {{this.setupFormElement}}
      class="au-c-form"
      ...attributes
      as |form|
    >
      <form.Field @name="subject" as |field|>
        <AuFormRow>
          <AuLabel
            for={{field.id}}
            @required={{true}}
            @requiredLabel="Required"
          >Subject</AuLabel>
          <PowerSelect
            id={{field.id}}
            {{@initialFocus}}
            {{! For some reason need to manually set width }}
            class="au-u-1-1"
            @searchEnabled={{true}}
            @options={{this.subjectOptions}}
            @selected={{this.formData.subject}}
            @onChange={{this.updateField
              field.triggerValidation
              field.setValue
            }}
            @onKeydown={{this.onPowerSelectKeydown}}
            @allowClear={{true}}
            as |obj|
          >
            {{obj}}
          </PowerSelect>
          <field.Errors class="au-u-1-1 au-u-margin-top-tiny" as |errors|>
            <AuAlert
              class="au-u-margin-none"
              @skin="warning"
              @size="small"
              @icon="alert-triangle"
            >
              {{#let (get errors 0) as |error|}}
                {{error.message}}
              {{/let}}
            </AuAlert>
          </field.Errors>
        </AuFormRow>
      </form.Field>
      <form.Field @name="predicate" as |field|>
        <AuFormRow>
          <AuLabel
            for={{field.id}}
            @required={{true}}
            @requiredLabel="Required"
          >Predicate</AuLabel>
          <PowerSelect
            id={{field.id}}
            {{! For some reason need to manually set width }}
            class="au-u-1-1"
            @searchEnabled={{true}}
            @options={{@predicateOptions}}
            @selected={{field.value}}
            @onChange={{this.updateField
              field.triggerValidation
              field.setValue
            }}
            @onKeydown={{this.onPowerSelectKeydown}}
            @allowClear={{true}}
            as |obj|
          >
            {{obj}}
          </PowerSelect>
          <field.Errors class="au-u-1-1 au-u-margin-top-tiny" as |errors|>
            <AuAlert
              class="au-u-margin-none"
              @skin="warning"
              @size="small"
              @icon="alert-triangle"
            >
              {{#let (get errors 0) as |error|}}
                {{error.message}}
              {{/let}}
            </AuAlert>
          </field.Errors>
        </AuFormRow>
      </form.Field>
    </HeadlessForm>
  </template>
}
