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
import { TrackedObject } from 'tracked-built-ins';
import { not } from 'ember-truth-helpers';
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
import type {
  ContentLiteralTerm,
  LiteralNodeTerm,
  ResourceNodeTerm,
  SayLiteral,
  SayTerm,
} from '#root/core/say-data-factory/index.ts';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import type {
  Direction,
  ObjectOption,
  ObjectOptionGenerator,
  PredicateOptionGenerator,
  SubjectOptionGenerator,
  SubmissionBody,
  TermOption,
} from '../types.ts';
import { LANG_STRING } from '#root/utils/_private/constants.ts';
import { isFullUri, isPrefixedUri } from '@lblod/marawa/rdfa-helpers';

const OBJECT_TERM_TYPES = [
  'NamedNode',
  'LiteralNode',
  'ResourceNode',
  'Literal',
] as const;

type RelationshipEditorDevModalSig = {
  Element: AuModalSignature['Element'];
  Args: {
    title?: string;
    source: LiteralNodeTerm | ResourceNodeTerm<string>;
    supportedDirections?:
      | ['property']
      | ['backlink']
      | ['property', 'backlink'];
    onSubmit: (body: SubmissionBody) => unknown;
    onCancel: () => unknown;
    predicateOptionGenerator?: PredicateOptionGenerator;
    subjectOptionGenerator?: SubjectOptionGenerator;
    objectOptionGenerator?: ObjectOptionGenerator;
    initialData?: FormData;
  };
};

export type FormData = Partial<SubmissionBody> & {
  direction?: Direction;
};

const formSchema = yup.object({
  direction: yup.string().oneOf(['property', 'backlink']),
  predicate: yup.object(),
  target: yup.object(),
});

export default class RelationshipEditorDevModeModal extends Component<RelationshipEditorDevModalSig> {
  get supportedDirections(): Direction[] {
    return this.args.supportedDirections ?? ['property', 'backlink'];
  }

  get directionFieldDisabled() {
    return this.sourceIsLiteral || this.supportedDirections.length === 1;
  }

  get initialData(): FormData {
    const defaultDirection = this.sourceIsLiteral ? 'backlink' : 'property';
    if (this.args.initialData) {
      return {
        direction:
          this.args.initialData.direction ??
          this.args.initialData.predicate?.direction ??
          defaultDirection,
        ...this.args.initialData,
      };
    } else {
      return {
        direction: defaultDirection,
      };
    }
  }
  data: FormData = new TrackedObject(this.initialData);

  resetForm?: () => void;
  assignResetForm = (resetFn: () => void) => {
    this.resetForm = resetFn;
  };

  onSubmit = (data: SubmissionBody) => {
    this.args.onSubmit(data);
  };

  onCancel = () => {
    this.resetForm?.();
    this.args.onCancel();
  };

  setDirection = (validationFn: () => void, value: Direction) => {
    this.data.direction = value;
    validationFn();
    this.data.predicate = undefined;
    this.data.target = undefined;
  };

  setField = <FieldName extends keyof FormData>(
    validationFn: () => void,
    field: FieldName,
    value: FormData[FieldName],
  ) => {
    this.data[field] = value;
    validationFn();
  };

  onPredicateSelectKeydown = (select: Select, event: KeyboardEvent) => {
    if (
      event.key === 'Enter' &&
      select.isOpen &&
      !select.highlighted &&
      !!select.searchText
    ) {
      const { searchText } = select;
      const isUri = isFullUri(searchText) || isPrefixedUri(searchText);
      if (isUri) {
        select.actions.choose({
          direction: this.data.direction,
          term: sayDataFactory.namedNode(searchText),
        });
      }
      return false;
    }
    return;
  };

  onTargetSelectKeydown = (select: Select, event: KeyboardEvent) => {
    if (
      event.key === 'Enter' &&
      select.isOpen &&
      !select.highlighted &&
      !!select.searchText
    ) {
      const { searchText } = select;
      const isUri = isFullUri(searchText) || isPrefixedUri(searchText);
      if (
        this.data.direction === 'property' ||
        (this.data.direction === 'backlink' && isUri)
      ) {
        const term = isUri
          ? sayDataFactory.namedNode(searchText)
          : sayDataFactory.literal(searchText);
        select.actions.choose({ term });
      }
      return false;
    }
  };

  get showTargetTermTypeSelector() {
    return this.data.direction === 'property' && this.data.target;
  }

  get showDatatypeAndLanguageOptions() {
    return (
      this.data.target &&
      (this.data.target.term.termType === 'Literal' ||
        this.data.target.term.termType === 'ContentLiteral')
    );
  }

  setTermType = (termType: (typeof OBJECT_TERM_TYPES)[number]) => {
    if (!this.data.target) {
      return;
    }
    const targetTerm = this.data.target.term;
    console.log({
      ...targetTerm,
      termType,
    });
    this.data.target = {
      ...this.data.target,
      term: sayDataFactory.fromTerm({
        ...targetTerm,
        termType,
      }) as ObjectOption['term'],
    };
  };

  setDatatype = (event: Event) => {
    const datatype = (event.target as HTMLInputElement).value;
    if (!this.data.target) {
      return;
    }
    const targetTerm = this.data.target.term;
    if (
      targetTerm.termType !== 'Literal' &&
      targetTerm.termType !== 'ContentLiteral'
    ) {
      return;
    }
    this.data.target = {
      ...this.data.target,
      term: sayDataFactory.fromTerm({
        ...targetTerm,
        datatype: sayDataFactory.namedNode(datatype),
      }) as ContentLiteralTerm | SayLiteral,
    };
  };

  setLanguage = (event: Event) => {
    const language = (event.target as HTMLInputElement).value;
    if (!this.data.target) {
      return;
    }
    const targetTerm = this.data.target.term;
    if (
      targetTerm.termType !== 'Literal' &&
      targetTerm.termType !== 'ContentLiteral'
    ) {
      return;
    }
    this.data.target = {
      ...this.data.target,
      term: sayDataFactory.fromTerm({
        ...targetTerm,
        language,
        datatype: sayDataFactory.namedNode(LANG_STRING),
      }) as ContentLiteralTerm | SayLiteral,
    };
  };

  searchPredicates = async (searchString: string) => {
    const options = await this.args.predicateOptionGenerator?.({
      searchString,
      selectedSource: this.args.source,
      direction: this.data.direction,
    });
    return options ?? [];
  };

  searchTargets = async (searchString: string) => {
    const generatorFunction =
      this.data.predicate?.direction === 'property'
        ? this.args.objectOptionGenerator
        : this.args.subjectOptionGenerator;
    const options = await generatorFunction?.({
      searchString,
      selectedPredicate: this.data.predicate?.term,
      selectedSource: this.args.source,
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
    return this.data.direction === 'property' ? 'Object' : 'Subject';
  }

  get sourceIsLiteral() {
    return this.args.source.termType === 'LiteralNode';
  }

  get title() {
    return this.args.title ?? 'Add relationship';
  }

  <template>
    <AuModal @modalOpen={{true}} @closeModal={{@onCancel}}>
      <:title>{{this.title}}</:title>
      <:body>
        <WithUniqueId as |formId|>
          <HeadlessForm
            id={{formId}}
            @data={{this.data}}
            @dataMode="mutable"
            @onSubmit={{this.onSubmit}}
            @validate={{validateYup formSchema}}
            class="au-o-flow--small"
            as |form|
          >
            {{this.assignResetForm form.reset}}
            <AuFormRow>
              <AuLabel>
                Source
              </AuLabel>
              <p>{{@source.value}}</p>
            </AuFormRow>
            <form.Field @name="direction" as |field|>
              <AuFormRow>
                <AuLabel for={{field.id}}>
                  Direction
                </AuLabel>
                <PowerSelect
                  id={{field.id}}
                  @selected={{field.value}}
                  @disabled={{this.directionFieldDisabled}}
                  @onChange={{fn this.setDirection field.triggerValidation}}
                  @allowClear={{true}}
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
            <form.Field @name="predicate" as |field|>
              <AuFormRow>
                <AuLabel for={{field.id}}>
                  Predicate
                </AuLabel>
                <PowerSelect
                  id={{field.id}}
                  @selected={{field.value}}
                  @onKeydown={{this.onPredicateSelectKeydown}}
                  @onChange={{fn
                    this.setField
                    field.triggerValidation
                    "predicate"
                  }}
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
                    <p><strong>{{this.optionRepr option}}</strong></p>
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
                <PowerSelect
                  id={{field.id}}
                  @selected={{field.value}}
                  @onKeydown={{this.onTargetSelectKeydown}}
                  @onChange={{fn
                    this.setField
                    field.triggerValidation
                    "target"
                  }}
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
                    <p><strong>{{this.optionRepr option}}</strong></p>
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
                      {{error.message}}
                    {{/let}}
                  </AuAlert>
                </field.Errors>
              </AuFormRow>
              {{#if this.showTargetTermTypeSelector}}
                <AuFormRow>
                  <WithUniqueId as |id|>
                    <AuLabel for={{id}}>Term type</AuLabel>
                    <PowerSelect
                      id={{id}}
                      @selected={{this.data.target.term.termType}}
                      @onChange={{this.setTermType}}
                      @allowClear={{true}}
                      {{! @glint-expect-error }}
                      @options={{OBJECT_TERM_TYPES}}
                      class="au-u-1-1"
                      as |option|
                    >
                      {{option}}
                    </PowerSelect>
                  </WithUniqueId>
                </AuFormRow>
              {{/if}}
              {{#if this.showDatatypeAndLanguageOptions}}
                <div class="au-u-flex au-u-flex--row au-u-flex--spaced-tiny">
                  <WithUniqueId as |id|>
                    <div class="au-u-1-5 au-u-flex au-u-flex--column">
                      <AuLabel for={{id}}>Language</AuLabel>
                      <AuInput
                        id={{id}}
                        {{on "input" this.setLanguage}}
                        {{! @glint-expect-error }}
                        value={{this.data.target.term.language}}
                      />
                    </div>
                  </WithUniqueId>
                  <WithUniqueId as |id|>
                    <div class="au-u-4-5 au-u-flex au-u-flex--column">
                      <AuLabel for={{id}}>Datatype</AuLabel>
                      <AuInput
                        id={{id}}
                        {{on "input" this.setDatatype}}
                        {{! @glint-expect-error }}
                        value={{this.data.target.term.datatype.value}}
                      />
                    </div>
                  </WithUniqueId>

                </div>
                <AuFormRow />
              {{/if}}
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
