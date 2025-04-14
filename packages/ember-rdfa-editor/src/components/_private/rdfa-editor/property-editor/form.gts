import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PowerSelect, {
  type Select,
} from 'ember-power-select/components/power-select';
import type { OutgoingTriple, SayTermType } from '#root/core/rdfa-processor.ts';
import {
  languageOrDataType,
  sayDataFactory,
} from '#root/core/say-data-factory/index.ts';
import {
  getNodeByRdfaId,
  getSubjects,
  rdfaInfoPluginKey,
} from '#root/plugins/rdfa-info/index.ts';
import { unwrap } from '#root/utils/_private/option.ts';
import { localCopy } from 'tracked-toolbox';
import { ValidationError, object, string } from 'yup';
import {
  contentLiteralTermSchema,
  literalNodeTermSchema,
  literalTermSchema,
  namedNodeTermSchema,
  resourceNodeTermSchema,
} from '../object-term-schemas.ts';
import type SayController from '#root/core/say-controller.ts';
import { on } from '@ember/modifier';
import AuFormRow from '@appuniversum/ember-appuniversum/components/au-form-row';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import { eq } from 'ember-truth-helpers';
// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import type { ModifierLike } from '@glint/template';
import { modifier } from 'ember-modifier';
import WithUniqueId from '../../with-unique-id.ts';

type SupportedTermType =
  | 'NamedNode'
  | 'LiteralNode'
  | 'ResourceNode'
  | 'Literal'
  | 'ContentLiteral';
const allTermTypes: SupportedTermType[] = [
  'NamedNode',
  'LiteralNode',
  'ResourceNode',
  'Literal',
  'ContentLiteral',
];

interface Sig {
  Args: {
    subject?: string;
    initialFocus?: ModifierLike<{ Element: HTMLElement }>;
    triple?: OutgoingTriple;
    termTypes?: SupportedTermType[];
    defaultTermType?: SupportedTermType;
    controller?: SayController;
    onInput?(newTriple: Partial<OutgoingTriple>): void;
    onSubmit?(newTriple: OutgoingTriple, subject?: string): void;
    onKeyDown?: (
      form: HTMLFormElement,
      event: KeyboardEvent,
    ) => boolean | undefined;
    importedResources?: string[] | false;
    predicateOptions?: string[];
    objectOptions?: string[];
  };
  Element: HTMLFormElement;
}
const namedNodeSchema = object({
  predicate: string().curie().required(),
  object: namedNodeTermSchema,
});
const literalSchema = object({
  predicate: string().curie().required(),
  object: literalTermSchema,
});
const literalNodeSchema = object({
  predicate: string().curie().required(),
  object: literalNodeTermSchema,
});
const resourceNodeSchema = object({
  predicate: string().curie().required(),
  object: resourceNodeTermSchema,
});
const contentLiteralSchema = object({
  predicate: string().curie().required(),
  object: contentLiteralTermSchema,
});

const DEFAULT_TRIPLE: OutgoingTriple = {
  predicate: '',
  object: sayDataFactory.namedNode(''),
};
export default class PropertyEditorForm extends Component<Sig> {
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

  @localCopy('args.triple.object.termType')
  selectedTermType?: SayTermType;

  @localCopy('args.triple.object.value')
  linkedResourceNode?: string;

  @localCopy('args.triple.object.value')
  linkedLiteralNode?: string;

  @localCopy('args.subject')
  subject: string | undefined;
  @localCopy('args.triple.predicate.value')
  predicate?: string;
  @localCopy('args.triple.object.value')
  object?: string;

  @tracked
  errors: ValidationError[] = [];
  @tracked
  currentFormData: FormData | null = null;
  get termTypes(): SupportedTermType[] {
    return this.args.termTypes ?? allTermTypes;
  }
  get defaultTermType() {
    return this.args.defaultTermType ?? this.termTypes[0];
  }

  get triple() {
    return this.args.triple ?? DEFAULT_TRIPLE;
  }

  get termType() {
    return this.selectedTermType ?? this.defaultTermType;
  }
  get controller() {
    return this.args.controller;
  }
  get selectedLiteralNode(): string | null {
    if (this.termType !== 'LiteralNode') {
      return null;
    }
    return this.linkedLiteralNode ?? null;
  }
  get selectedResourceNode(): string | null {
    if (this.termType !== 'ResourceNode') {
      return null;
    }
    return this.linkedResourceNode ?? null;
  }

  get literals(): string[] {
    if (!this.controller) {
      return [];
    }
    const rdfaIdMapping = rdfaInfoPluginKey.getState(
      this.controller.mainEditorState,
    )?.rdfaIdMapping;
    if (!rdfaIdMapping) {
      return [];
    }
    const result: string[] = [];
    rdfaIdMapping.forEach((resolvedNode, rdfaId) => {
      if (resolvedNode.value.attrs['rdfaNodeType'] === 'literal') {
        result.push(rdfaId);
      }
    });
    return result;
  }

  get resources(): string[] {
    if (!this.controller) {
      return [];
    }
    return getSubjects(this.controller.mainEditorState).filter(
      (resource) => !(this.args.importedResources || [])?.includes(resource),
    );
  }

  get initialDatatypeValue(): string {
    if (!this.controller) {
      return '';
    }
    if (
      this.triple.object.termType === 'Literal' ||
      this.triple.object.termType === 'ContentLiteral'
    ) {
      const { language, datatype } = this.triple.object;
      if (language.length) {
        return '';
      } else {
        return datatype.value;
      }
    }
    return '';
  }

  get initialLanguageValue(): string {
    if (!this.controller) {
      return '';
    }
    if (
      this.triple.object.termType === 'Literal' ||
      this.triple.object.termType === 'ContentLiteral'
    ) {
      const { language } = this.triple.object;
      return language;
    }
    return '';
  }

  get hasDatatype(): boolean {
    return (
      !this.hasLanguage &&
      Boolean(
        this.currentFormData?.get('object.datatype.value')?.toString().length,
      )
    );
  }

  get hasLanguage(): boolean {
    return Boolean(
      this.currentFormData?.get('object.language')?.toString().length,
    );
  }

  get documentSubjects(): string[] {
    if (!this.controller) {
      return [];
    }
    return getSubjects(this.controller.mainEditorState);
  }

  get objectOptions(): string[] {
    return [
      ...(this.args.objectOptions ?? []),
      ...this.documentSubjects,
    ] as string[];
  }

  resourceNodeLabel = (resource: string): string => {
    return resource;
  };
  literalNodeLabel = (rdfaId: string): string => {
    if (!this.controller) {
      return '';
    }
    const node = unwrap(
      getNodeByRdfaId(this.controller.mainEditorState, rdfaId),
    );
    const content = node.value.textContent;
    const truncatedContent =
      content.length <= 20 ? content : `${content.substring(0, 20)}...`;
    return `${truncatedContent} (${rdfaId})`;
  };
  validateFormData(
    formData: FormData,
  ):
    | { valid: true; triple: OutgoingTriple; subject?: string }
    | { valid: false; errors: ValidationError[] } {
    try {
      if (this.args.importedResources && !this.subject) {
        throw new ValidationError(
          'Need to specify subject to link from when importing resources',
          this.subject,
          'subject',
        );
      }
      switch (this.termType) {
        case 'NamedNode': {
          const validated = namedNodeSchema.validateSync(
            {
              predicate: this.predicate?.toString(),
              object: {
                termType: 'NamedNode',
                value: this.object?.toString(),
              },
            },
            { abortEarly: false },
          );

          return {
            valid: true,
            triple: {
              predicate: validated.predicate,
              object: sayDataFactory.namedNode(validated.object.value),
            },
            subject: this.subject,
          };
        }
        case 'Literal': {
          const { predicate, object } = literalSchema.validateSync(
            {
              predicate: this.predicate?.toString(),
              object: {
                termType: 'Literal',
                value: formData.get('object.value')?.toString(),
                datatype: {
                  termType: 'NamedNode',
                  value: formData.get('object.datatype.value')?.toString(),
                },
                language: formData.get('object.language')?.toString(),
              },
            },

            { abortEarly: false },
          );

          return {
            valid: true,
            triple: {
              predicate,
              object: sayDataFactory.literal(
                object.value,
                languageOrDataType(
                  object.language,
                  object.datatype &&
                    sayDataFactory.namedNode(object.datatype.value),
                ),
              ),
            },
            subject: this.subject,
          };
        }
        case 'LiteralNode': {
          const {
            predicate,
            object: { value },
          } = literalNodeSchema.validateSync(
            {
              predicate: this.predicate?.toString(),
              object: {
                termType: 'LiteralNode',
                value: this.selectedLiteralNode,
              },
            },
            { abortEarly: false },
          );

          return {
            valid: true,
            triple: {
              predicate,
              object: sayDataFactory.literalNode(value),
            },
            subject: this.subject,
          };
        }
        case 'ResourceNode': {
          const {
            predicate,
            object: { value },
          } = resourceNodeSchema.validateSync(
            {
              predicate: this.predicate?.toString(),
              object: {
                termType: 'ResourceNode',
                value: this.selectedResourceNode,
              },
            },
            { abortEarly: false },
          );

          return {
            valid: true,
            triple: { predicate, object: sayDataFactory.resourceNode(value) },
            subject: this.subject,
          };
        }
        case 'ContentLiteral': {
          const {
            predicate,
            object: { datatype, language },
          } = contentLiteralSchema.validateSync(
            {
              predicate: this.predicate?.toString(),
              object: {
                termType: 'ContentLiteral',
                datatype: {
                  termType: 'NamedNode',
                  value: formData.get('object.datatype.value')?.toString(),
                },
                language: formData.get('object.language')?.toString(),
              },
            },
            { abortEarly: false },
          );

          return {
            valid: true,
            triple: {
              predicate,
              object: sayDataFactory.contentLiteral(
                languageOrDataType(
                  language,
                  sayDataFactory.namedNode(datatype.value),
                ),
              ),
            },
            subject: this.subject,
          };
        }
        // ts apparently not smart enough to see this can't happen
        default: {
          return { valid: false, errors: [] };
        }
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        return { valid: false, errors: e.inner };
      } else {
        throw e;
      }
    }
  }
  findError = (path: string) => {
    return this.errors.find((error) => error.path === path)?.message ?? null;
  };

  @action
  setSubject(subject: string) {
    this.subject = subject;
  }
  @action
  setPredicate(predicate: string) {
    this.predicate = predicate;
  }
  @action
  setObject(object: string) {
    this.object = object;
  }

  onPowerSelectKeydown = (allowCustom: boolean) => {
    return (select: Select, event: KeyboardEvent) => {
      if (this.formElement && this.args.onKeyDown) {
        this.args.onKeyDown(this.formElement, event);
      }
      // Based on example from ember-power-select docs, allows for selecting a previously non-existent
      // entry by typing in the power-select 'search' and hitting 'enter'
      if (
        allowCustom &&
        event.key === 'Enter' &&
        select.isOpen &&
        !select.highlighted &&
        !!select.searchText
      ) {
        select.actions.choose(select.searchText);
        return false;
      }
      return;
    };
  };

  @action
  setTermType(termType: SayTermType) {
    this.selectedTermType = termType;
    this.errors = [];
  }
  @action
  setLiteralNodeLink(rdfaId: string) {
    this.linkedLiteralNode = rdfaId;
  }
  @action
  setResourceNodeLink(resource: string) {
    this.linkedResourceNode = resource;
  }
  @action
  handleInput(event: InputEvent) {
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    this.currentFormData = formData;
  }
  @action
  handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    this.errors = [];
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const validated = this.validateFormData(formData);
    if (validated.valid) {
      this.args.onSubmit?.(validated.triple, validated.subject);
    } else {
      this.errors = validated.errors;
    }
  }
  @action
  afterInsert(formElement: HTMLFormElement) {
    const formData = new FormData(formElement);
    this.currentFormData = formData;
  }

  isArray = (obj: unknown) => {
    return Array.isArray(obj);
  };

  <template>
    <form
      {{on "submit" this.handleSubmit}}
      {{on "input" this.handleInput}}
      {{didInsert this.afterInsert}}
      {{this.setupFormElement}}
      ...attributes
    >
      {{#if (this.isArray @importedResources)}}
        <AuFormRow>
          <WithUniqueId as |id|>
            {{#let "subject" as |name|}}
              {{#let (this.findError name) as |error|}}
                <AuLabel
                  for={{id}}
                  @required={{true}}
                  @requiredLabel="Required"
                >Subject</AuLabel>
                <PowerSelect
                  {{@initialFocus}}
                  id={{id}}
                  {{! For some reason need to manually set width }}
                  class="au-u-1-1"
                  @searchEnabled={{true}}
                  @options={{@importedResources}}
                  @selected={{this.subject}}
                  @onChange={{this.setSubject}}
                  @onKeydown={{this.onPowerSelectKeydown true}}
                  @allowClear={{true}}
                  as |obj|
                >
                  {{obj}}
                </PowerSelect>
                {{#if error}}
                  <AuPill>{{error}}</AuPill>
                {{/if}}
              {{/let}}
            {{/let}}
          </WithUniqueId>
        </AuFormRow>
      {{/if}}
      <AuFormRow>
        <WithUniqueId as |id|>
          {{#let "predicate" as |name|}}
            {{#let (this.findError name) as |error|}}
              <AuLabel
                for={{id}}
                @required={{true}}
                @requiredLabel="Required"
              >Predicate</AuLabel>
              <PowerSelect
                {{(unless (this.isArray @importedResources) @initialFocus)}}
                id={{id}}
                {{! For some reason need to manually set width }}
                class="au-u-1-1"
                @searchEnabled={{true}}
                @options={{@predicateOptions}}
                @selected={{this.predicate}}
                @onChange={{this.setPredicate}}
                @onKeydown={{this.onPowerSelectKeydown true}}
                @allowClear={{true}}
                as |obj|
              >
                {{obj}}
              </PowerSelect>
              {{#if error}}
                <AuPill>{{error}}</AuPill>
              {{/if}}
            {{/let}}
          {{/let}}
        </WithUniqueId>

      </AuFormRow>
      <AuFormRow>
        <WithUniqueId as |id|>
          {{#let "object.termType" as |name|}}
            {{#let (this.findError name) as |error|}}
              <AuLabel
                for={{id}}
                @required={{true}}
                @requiredLabel="Required"
              >TermType</AuLabel>
              <PowerSelect
                id={{id}}
                {{! For some reason need to manually set width }}
                class="au-u-1-1"
                @searchEnabled={{false}}
                @options={{this.termTypes}}
                @selected={{this.termType}}
                @onChange={{this.setTermType}}
                @onKeydown={{this.onPowerSelectKeydown false}}
                @allowClear={{true}}
                as |obj|
              >
                {{obj}}
              </PowerSelect>
              {{#if error}}
                <AuPill>{{error}}</AuPill>
              {{/if}}
            {{/let}}
          {{/let}}
        </WithUniqueId>
      </AuFormRow>
      {{! I tried deduplicating these, but they all need slightly different validation so there's no point}}
      {{#if (eq this.termType "NamedNode")}}
        <AuFormRow>
          <WithUniqueId as |id|>
            {{#let "object.value" as |name|}}
              {{#let (this.findError name) as |error|}}
                <AuLabel
                  for={{id}}
                  @required={{true}}
                  @requiredLabel="Required"
                >URI</AuLabel>
                <PowerSelect
                  id={{id}}
                  {{! For some reason need to manually set width }}
                  class="au-u-1-1"
                  @searchEnabled={{true}}
                  @options={{this.objectOptions}}
                  @selected={{this.object}}
                  @onChange={{this.setObject}}
                  @onKeydown={{this.onPowerSelectKeydown true}}
                  @allowClear={{true}}
                  as |obj|
                >
                  {{obj}}
                </PowerSelect>
                {{#if error}}
                  <AuPill>{{error}}</AuPill>
                {{/if}}
              {{/let}}
            {{/let}}
          </WithUniqueId>
        </AuFormRow>
      {{else if (eq this.termType "Literal")}}
        <AuFormRow>
          <WithUniqueId as |id|>
            {{#let "object.value" as |name|}}
              {{#let (this.findError name) as |error|}}
                <AuLabel
                  for={{id}}
                  @required={{true}}
                  @requiredLabel="Required"
                >Value</AuLabel>
                <AuInput
                  id={{id}}
                  name={{name}}
                  value={{this.triple.object.value}}
                  required={{true}}
                  @width="block"
                />
                {{#if error}}
                  <AuPill>{{error}}</AuPill>
                {{/if}}
              {{/let}}
            {{/let}}
          </WithUniqueId>
        </AuFormRow>
        <AuFormRow>
          <WithUniqueId as |id|>
            {{#let "object.datatype.value" as |name|}}
              {{#let (this.findError name) as |error|}}
                <AuLabel
                  for={{id}}
                  @required={{false}}
                  @requiredLabel="Required"
                >Datatype</AuLabel>
                <AuInput
                  id={{id}}
                  name={{name}}
                  value={{this.initialDatatypeValue}}
                  required={{false}}
                  @width="block"
                  @disabled={{this.hasLanguage}}
                />
                {{#if error}}
                  <AuPill>{{error}}</AuPill>
                {{/if}}
              {{/let}}
            {{/let}}
          </WithUniqueId>
        </AuFormRow>
        <AuFormRow>
          <WithUniqueId as |id|>
            {{#let "object.language" as |name|}}
              {{#let (this.findError name) as |error|}}
                <AuLabel
                  for={{id}}
                  @required={{false}}
                  @requiredLabel="Required"
                >Language</AuLabel>
                <AuInput
                  id={{id}}
                  name={{name}}
                  value={{this.initialLanguageValue}}
                  required={{false}}
                  @width="block"
                  @disabled={{this.hasDatatype}}
                />
                {{#if error}}
                  <AuPill>{{error}}</AuPill>
                {{/if}}
              {{/let}}
            {{/let}}
          </WithUniqueId>
        </AuFormRow>
      {{else if (eq this.termType "LiteralNode")}}
        <AuFormRow>
          <WithUniqueId as |id|>
            {{#let "object.value" as |name|}}
              {{#let (this.findError name) as |error|}}
                <AuLabel
                  for={{id}}
                  @required={{true}}
                  @requiredLabel="Required"
                >
                  Object
                </AuLabel>
                <PowerSelect
                  id={{id}}
                  {{! For some reason need to manually set width }}
                  class="au-u-1-1"
                  @searchEnabled={{false}}
                  @options={{this.literals}}
                  @selected={{this.selectedLiteralNode}}
                  @onChange={{this.setLiteralNodeLink}}
                  @onKeydown={{this.onPowerSelectKeydown false}}
                  @allowClear={{true}}
                  @placeholder="Select a literal"
                  as |obj|
                >
                  {{this.literalNodeLabel obj}}
                </PowerSelect>
                {{#if error}}
                  <AuPill>{{error}}</AuPill>
                {{/if}}
              {{/let}}
            {{/let}}
          </WithUniqueId>
        </AuFormRow>
      {{else if (eq this.termType "ResourceNode")}}
        <AuFormRow>
          <WithUniqueId as |id|>
            {{#let "object.value" as |name|}}
              {{#let (this.findError name) as |error|}}
                <AuLabel
                  for={{id}}
                  @required={{true}}
                  @requiredLabel="Required"
                >
                  Object
                </AuLabel>
                <PowerSelect
                  id={{id}}
                  {{! For some reason need to manually set width }}
                  class="au-u-1-1"
                  @searchEnabled={{false}}
                  @options={{this.resources}}
                  @selected={{this.selectedResourceNode}}
                  @onChange={{this.setResourceNodeLink}}
                  @onKeydown={{this.onPowerSelectKeydown false}}
                  @allowClear={{true}}
                  @placeholder="Select a resource"
                  as |obj|
                >
                  {{this.resourceNodeLabel obj}}
                </PowerSelect>
                {{#if error}}
                  <AuPill>{{error}}</AuPill>
                {{/if}}
              {{/let}}
            {{/let}}
          </WithUniqueId>
        </AuFormRow>
      {{else if (eq this.termType "ContentLiteral")}}
        <AuFormRow>
          <WithUniqueId as |id|>
            {{#let "object.datatype.value" as |name|}}
              {{#let (this.findError name) as |error|}}
                <AuLabel
                  for={{id}}
                  @required={{false}}
                  @requiredLabel="Required"
                >Datatype</AuLabel>
                <AuInput
                  id={{id}}
                  name={{name}}
                  value={{this.initialDatatypeValue}}
                  required={{false}}
                  @width="block"
                  @disabled={{this.hasLanguage}}
                />
                {{#if error}}
                  <AuPill>{{error}}</AuPill>
                {{/if}}
              {{/let}}
            {{/let}}
          </WithUniqueId>

        </AuFormRow>
        <AuFormRow>
          <WithUniqueId as |id|>
          {{#let "object.language" as |name|}}
            {{#let (this.findError name) as |error|}}
              <AuLabel
                for={{id}}
                @required={{false}}
                @requiredLabel="Required"
              >Language</AuLabel>
              <AuInput
                id={{id}}
                name={{name}}
                value={{this.initialLanguageValue}}
                required={{false}}
                @width="block"
                @disabled={{this.hasDatatype}}
              />
              {{#if error}}
                <AuPill>{{error}}</AuPill>
              {{/if}}
            {{/let}}
          {{/let}}
          </WithUniqueId>
        </AuFormRow>
      {{/if}}

    </form>
  </template>
}
