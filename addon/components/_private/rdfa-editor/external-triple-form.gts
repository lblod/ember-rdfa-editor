import Component from '@glimmer/component';
import { ValidationError, object, string } from 'yup';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import type { FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { localCopy } from 'tracked-toolbox';
import { literalTermSchema, namedNodeTermSchema } from './object-term-schemas';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuPill from '@appuniversum/ember-appuniversum/components/au-label';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import WithUniqueId from '../with-unique-id';
import {
  languageOrDataType,
  sayDataFactory,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';
import PowerSelect from 'ember-power-select/components/power-select';
import { eq } from 'ember-truth-helpers';
import { type Option } from '@lblod/ember-rdfa-editor/utils/_private/option';

const predicateSchema = string().curie().required();

const literalTripleSchema = object({
  subject: namedNodeTermSchema,
  predicate: predicateSchema,
  object: literalTermSchema,
});
const namedNodeTripleSchema = object({
  subject: namedNodeTermSchema,
  predicate: predicateSchema,
  object: namedNodeTermSchema,
});
interface ValidResult {
  valid: true;
  triple: FullTriple;
}
interface InvalidResult {
  valid: false;
  errors: ValidationError[];
}
type ValidationResult = ValidResult | InvalidResult;
interface ExternalTripleFormSig {
  Element: HTMLFormElement;
  Args: {
    onSubmit: (trip: FullTriple) => void;
    triple?: Option<FullTriple>;
  };
}
const DEFAULT_TRIPLE: FullTriple = {
  subject: sayDataFactory.namedNode(''),
  predicate: '',
  object: sayDataFactory.namedNode(''),
};
type SupportedTermType = 'NamedNode' | 'Literal';
export default class ExternalTripleForm extends Component<ExternalTripleFormSig> {
  @localCopy('args.triple.subject.value')
  subject: string = '';

  @localCopy('args.triple.object.termType')
  selectedTermType?: SupportedTermType;

  @tracked
  predicate: string = '';

  @tracked
  object: string = '';

  @tracked
  errors: ValidationError[] = [];

  @tracked
  currentFormData: FormData | null = null;
  get termType() {
    return this.selectedTermType ?? 'NamedNode';
  }
  get triple() {
    return this.args.triple ?? DEFAULT_TRIPLE;
  }
  get datatype() {
    if (this.triple.object.termType === 'Literal') {
      return this.triple.object.datatype.value;
    }
    return '';
  }
  get language() {
    if (this.triple.object.termType === 'Literal') {
      return this.triple.object.language;
    }
    return '';
  }
  get termTypes(): SupportedTermType[] {
    return ['NamedNode', 'Literal'];
  }
  selectTermType = (value: SupportedTermType) => {
    this.selectedTermType = value;
    this.errors = [];
  };
  extractNamedNode = (formData: FormData, base: string) => {
    return {
      termType: 'NamedNode',
      value: formData.get(`${base}.value`)?.toString(),
    };
  };
  extractLiteral = (formData: FormData, base: string) => {
    const extractedDatatype = this.extractNamedNode(
      formData,
      `${base}.datatype`,
    );
    const datatype = extractedDatatype?.value?.length
      ? extractedDatatype
      : undefined;

    return {
      termType: 'Literal',
      value: formData.get(`${base}.value`)?.toString(),
      datatype,
      language: formData.get(`${base}.language`)?.toString(),
    };
  };
  validateFormData = (formData: FormData): ValidationResult => {
    try {
      if (this.termType === 'NamedNode') {
        const validated = namedNodeTripleSchema.validateSync(
          {
            subject: this.extractNamedNode(formData, 'subject'),
            predicate: formData.get('predicate')?.toString(),
            object: this.extractNamedNode(formData, 'object'),
          },
          { abortEarly: false },
        );
        return {
          valid: true,
          triple: {
            subject: sayDataFactory.namedNode(validated.subject.value),
            predicate: validated.predicate,
            object: sayDataFactory.namedNode(validated.object.value),
          },
        };
      } else {
        const validated = literalTripleSchema.validateSync(
          {
            subject: this.extractNamedNode(formData, 'subject'),
            predicate: formData.get('predicate')?.toString(),
            object: this.extractLiteral(formData, 'object'),
          },
          { abortEarly: false },
        );

        return {
          valid: true,
          triple: {
            subject: sayDataFactory.namedNode(validated.subject.value),
            predicate: validated.predicate,
            object:
              validated.object &&
              sayDataFactory.literal(
                validated.object.value,
                languageOrDataType(
                  validated.object.language,
                  validated.object.datatype &&
                    sayDataFactory.namedNode(validated.object.datatype.value),
                ),
              ),
          },
        };
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        return { valid: false, errors: e.inner };
      } else {
        throw e;
      }
    }
  };

  handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const validation = this.validateFormData(formData);
    if (validation.valid) {
      this.args.onSubmit?.(validation.triple);
    } else {
      this.errors = validation.errors;
    }
  };
  handleInput = (event: Event) => {
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    this.currentFormData = formData;
  };
  <template>
    <form
      ...attributes
      {{on 'submit' this.handleSubmit}}
      {{on 'input' this.handleInput}}
    >

      <StringField
        @name='subject.value'
        @required={{true}}
        @errors={{this.errors}}
        @value={{this.triple.subject.value}}
      >Subject</StringField>
      <StringField
        @name='predicate'
        @required={{true}}
        @errors={{this.errors}}
        @value={{this.triple.predicate}}
      >Predicate</StringField>
      <TermTypeSelectField
        @name='termType'
        @selected={{this.termType}}
        @options={{this.termTypes}}
        @onChange={{this.selectTermType}}
        @errors={{this.errors}}
        @required={{true}}
      >
        TermType
      </TermTypeSelectField>
      <StringField
        @name='object.value'
        @required={{true}}
        @errors={{this.errors}}
        @value={{this.triple.object.value}}
      >Value</StringField>

      {{#unless (eq this.termType 'NamedNode')}}
        <StringField
          @name='object.datatype.value'
          @required={{false}}
          @errors={{this.errors}}
          @value={{this.datatype}}
        >Datatype</StringField>
        <StringField
          @name='object.language'
          @required={{false}}
          @errors={{this.errors}}
          @value={{this.language}}
        >Language</StringField>
      {{/unless}}
    </form>
  </template>
}
interface FieldArgs {
  name: string;
  errors: ValidationError[];
  required: boolean;
}
interface StringFieldSig {
  Blocks: {
    default: [];
  };
  Args: FieldArgs & { value: string };
}

// eslint-disable-next-line ember/no-empty-glimmer-component-classes
class StringField extends Component<StringFieldSig> {
  <template>
    <FormField @name={{@name}} @errors={{@errors}} @required={{@required}}>
      <:label>
        {{yield}}
      </:label>

      <:default as |id|>
        <AuInput
          id={{id}}
          name={{@name}}
          value={{@value}}
          required={{@required}}
          @width='block'
        />
      </:default>
    </FormField>
  </template>
}
interface SelectFieldArgs<T> extends FieldArgs {
  options: T[];
  selected: T;
  onChange: (newValue: T) => void;
}
interface SelectFieldSig<T> {
  Args: SelectFieldArgs<T>;
  Blocks: { default: [] };
}
// eslint-disable-next-line ember/no-empty-glimmer-component-classes
class SelectField<T> extends Component<SelectFieldSig<T>> {
  <template>
    <FormField @name={{@name}} @errors={{@errors}} @required={{@required}}>
      <:label>
        {{yield}}
      </:label>

      <:default as |id|>

        {{! @glint-expect-error our version of powerselect doesn't have good types}}
        <PowerSelect
          id={{id}}
          {{! For some reason need to manually set width }}
          class='au-u-1-1'
          @searchEnabled={{false}}
          @options={{@options}}
          @selected={{@selected}}
          @onChange={{@onChange}}
          as |obj|
        >
          {{obj}}
        </PowerSelect>
      </:default>
    </FormField>
  </template>
}
const TermTypeSelectField = SelectField<'NamedNode' | 'Literal'>;
interface FormFieldSig {
  Args: FieldArgs;
  Blocks: { default: [id: string]; label: [] };
}
class FormField extends Component<FormFieldSig> {
  findError = (errors: ValidationError[], path: string) => {
    return errors.find((error) => error.path === path)?.message ?? null;
  };
  <template>
    <AuFormRow>
      <WithUniqueId as |id|>
        {{#let (this.findError @errors @name) as |error|}}
          <AuLabel
            for={{id}}
            @required={{@required}}
            @requiredLabel='Required'
          >{{yield to='label'}}</AuLabel>
          {{yield id}}
          {{#if error}}
            <AuPill>{{error}}</AuPill>
          {{/if}}
        {{/let}}
      </WithUniqueId>
    </AuFormRow>
  </template>
}
