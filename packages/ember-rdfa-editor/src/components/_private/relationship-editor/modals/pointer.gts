import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuModal, {
  type AuModalSignature,
} from '@appuniversum/ember-appuniversum/components/au-modal';
import Component from '@glimmer/component';
import WithUniqueId from '#root/components/_private/utils/with-unique-id.ts';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import PowerSelectWithCreate from 'ember-power-select-with-create/components/power-select-with-create';
import { tracked, TrackedObject } from 'tracked-built-ins';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { HeadlessForm } from 'ember-headless-form';
import { fn } from '@ember/helper';
import * as yup from 'yup';
import { validateYup } from 'ember-headless-form-yup';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { get } from '@ember/helper';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';
import type { SayTerm } from '#root/core/say-data-factory/index.ts';
import type {
  Direction,
  ObjectOption,
  OptionGeneratorConfig,
  PointerSubmissionBody,
  SubjectOption,
  SubmissionBody,
  TermOption,
} from '../types.ts';
import { isFullUri, isPrefixedUri } from '@lblod/marawa/rdfa-helpers';
import { modifier } from 'ember-modifier';
import type { RdfaAttrs } from '#root/core/rdfa-types.js';

type RelationshipEditorDevModalSig = {
  Element: AuModalSignature['Element'];
  Args: {
    title?: string;
    sourceAttrs: RdfaAttrs;
    supportedDirections?:
      | ['property']
      | ['backlink']
      | ['property', 'backlink'];
    onSubmit: (body: SubmissionBody) => unknown;
    onCancel: () => unknown;
    optionGeneratorConfig?: OptionGeneratorConfig;
    initialData?: Partial<FormData>;
  };
};

export type FormData = Partial<PointerSubmissionBody>;

const formSchema = yup.object({
  pointerDirection: yup.string().oneOf(['property', 'backlink']),
  target: yup.object(),
});

const onFormKeyDown = (formElement: HTMLFormElement, event: KeyboardEvent) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    formElement.requestSubmit();
  }
  return true;
};

export default class RelationshipEditorPointerModal extends Component<RelationshipEditorDevModalSig> {
  formElement?: HTMLFormElement;
  setupFormElement = modifier((element: HTMLFormElement) => {
    this.formElement = element;
    const keyDownHandler = (event: KeyboardEvent) =>
      onFormKeyDown(element, event);
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  });

  @tracked initiallyFocusedElement?: HTMLElement;

  initialFocus = modifier((element: HTMLElement) => {
    this.initiallyFocusedElement = element;
  });

  get supportedDirections(): Direction[] {
    return this.args.supportedDirections ?? ['property', 'backlink'];
  }

  get directionFieldDisabled() {
    return this.sourceIsLiteral || this.supportedDirections.length === 1;
  }

  get initialData(): FormData {
    const defaultDirection = this.sourceIsLiteral ? 'backlink' : 'property';
    if (this.args.initialData && 'pointerDirection' in this.args.initialData) {
      return {
        pointerDirection:
          this.args.initialData.pointerDirection ?? defaultDirection,
        ...this.args.initialData,
      };
    } else {
      return {
        pointerDirection: defaultDirection,
      };
    }
  }
  data: FormData = new TrackedObject(this.initialData);

  get source() {
    if (this.args.sourceAttrs.rdfaNodeType === 'resource') {
      return sayDataFactory.resourceNode(this.args.sourceAttrs.subject);
    } else {
      return sayDataFactory.literalNode(this.args.sourceAttrs.__rdfaId);
    }
  }

  resetForm?: () => void;
  assignResetForm = (resetFn: () => void) => {
    this.resetForm = resetFn;
  };

  onCancel = () => {
    this.resetForm?.();
    this.args.onCancel();
  };

  setDirection = (validationFn: () => void, value: Direction) => {
    this.data.pointerDirection = value;
    validationFn();
    this.data.target = undefined;
  };

  isValidTarget = (term: string) => {
    if (!term) {
      return false;
    }
    const isUri = isFullUri(term) || isPrefixedUri(term);
    return (
      this.data.pointerDirection === 'property' ||
      (this.data.pointerDirection === 'backlink' && isUri)
    );
  };

  setTarget = (
    validationFn: () => void,
    targetOption?: ObjectOption | SubjectOption | string,
  ) => {
    if (typeof targetOption === 'string') {
      const isUri = isFullUri(targetOption) || isPrefixedUri(targetOption);
      if (
        this.data.pointerDirection === 'property' ||
        (this.data.pointerDirection === 'backlink' && isUri)
      ) {
        const term = isUri
          ? sayDataFactory.namedNode(targetOption)
          : sayDataFactory.literal(targetOption);
        this.data.target = {
          term,
        };
      }
    } else {
      this.data.target = targetOption;
    }
    validationFn();
  };

  buildPowerSelectWithCreateSuggestion = (term: string) => term;

  onPowerSelectKeyDown = (_select: Select, event: KeyboardEvent) => {
    if (this.formElement) {
      onFormKeyDown(this.formElement, event);
    }
    return true;
  };

  searchTargets = async (searchString: string) => {
    const generatorFunction =
      this.data.pointerDirection === 'property'
        ? this.args.optionGeneratorConfig?.pointerSources
        : this.args.optionGeneratorConfig?.pointerTargets;
    const options = await generatorFunction?.({
      searchString,
      selectedSource: this.source,
    });
    return options ?? [];
  };

  optionRepr = (option: TermOption<SayTerm>) => {
    if (option.label) {
      return `${option.term.value} (${option.label})`;
    } else {
      return option.term.value;
    }
  };

  get targetLabel() {
    // TODO rename
    return this.data.pointerDirection === 'property' ? 'Object' : 'Subject';
  }

  get sourceIsLiteral() {
    return (
      this.args.sourceAttrs.rdfaNodeType === 'literal' &&
      !this.args.sourceAttrs.isPointer
    );
  }

  get title() {
    return this.args.title ?? 'Add pointer';
  }

  <template>
    <AuModal
      @modalOpen={{true}}
      @closeModal={{@onCancel}}
      {{! @glint-expect-error appuniversum types should be adapted to accept an html element here }}
      @initialFocus={{this.initiallyFocusedElement}}
    >
      <:title>{{this.title}}</:title>
      <:body>
        <WithUniqueId as |formId|>
          <HeadlessForm
            id={{formId}}
            @data={{this.data}}
            @dataMode="mutable"
            @onSubmit={{@onSubmit}}
            @validate={{validateYup formSchema}}
            class="au-o-flow--small"
            as |form|
          >
            {{this.assignResetForm form.reset}}
            <AuFormRow>
              <AuLabel>
                Source
              </AuLabel>
              <p>{{this.source.value}}</p>
            </AuFormRow>
            <form.Field @name="pointerDirection" as |field|>
              <AuFormRow>
                <AuLabel for={{field.id}}>
                  Direction
                </AuLabel>
                <PowerSelect
                  id={{field.id}}
                  @selected={{field.value}}
                  @disabled={{this.directionFieldDisabled}}
                  @onChange={{fn this.setDirection field.triggerValidation}}
                  @options={{this.supportedDirections}}
                  class="au-u-1-1"
                  as |option|
                >
                  {{option}}
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
            <form.Field @name="target" as |field|>
              <AuFormRow>
                <AuLabel for={{field.id}}>
                  {{this.targetLabel}}
                </AuLabel>
                <PowerSelectWithCreate
                  id={{field.id}}
                  @selected={{field.value}}
                  @onKeydown={{this.onPowerSelectKeyDown}}
                  @onChange={{fn this.setTarget field.triggerValidation}}
                  @onCreate={{fn this.setTarget field.triggerValidation}}
                  @showCreateWhen={{this.isValidTarget}}
                  @buildSuggestion={{this.buildPowerSelectWithCreateSuggestion}}
                  @allowClear={{true}}
                  @options={{this.searchTargets ""}}
                  @search={{this.searchTargets}}
                  @searchEnabled={{true}}
                  class="au-u-1-1"
                  as |option|
                >
                  <div
                    class="au-u-flex au-u-flex--spaced-tiny au-u-flex--vertical-center"
                  >
                    <p><strong>{{this.optionRepr option}}</strong></p>
                  </div>
                  {{#if option.description}}
                    <p
                      class="say-relationship-editor__literal-preview"
                    >{{option.description}}</p>
                  {{/if}}
                </PowerSelectWithCreate>
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

            <AuButtonGroup class="au-u-margin-top">
              <AuButton form={{formId}} type="submit">Insert</AuButton>
              <AuButton
                @skin="secondary"
                {{on "click" this.onCancel}}
              >Cancel</AuButton>
            </AuButtonGroup>
          </HeadlessForm>
        </WithUniqueId>
      </:body>
    </AuModal>
  </template>
}
