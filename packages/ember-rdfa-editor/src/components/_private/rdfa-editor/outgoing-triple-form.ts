import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { type Select } from 'ember-power-select/components/power-select';
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
} from './object-term-schemas.ts';
import type SayController from '#root/core/say-controller.ts';

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
    triple?: OutgoingTriple;
    termTypes?: SupportedTermType[];
    defaultTermType?: SupportedTermType;
    controller?: SayController;
    onInput?(newTriple: Partial<OutgoingTriple>): void;
    onSubmit?(newTriple: OutgoingTriple, subject?: string): void;
    importedResources?: string[] | false;
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
export default class OutgoingTripleFormComponent extends Component<Sig> {
  @localCopy('args.triple.object.termType')
  selectedTermType?: SayTermType;

  @localCopy('args.triple.object.value')
  linkedResourceNode?: string;

  @localCopy('args.triple.object.value')
  linkedLiteralNode?: string;

  @tracked
  subject: string | undefined = undefined;

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
    console.log('Get datatype');
    if (!this.controller) {
      return '';
    }
    if (this.termType === 'LiteralNode') {
      const selectedLiteralNodeId = this.selectedLiteralNode;
      if (!selectedLiteralNodeId) {
        return '';
      }
      const literalNode = getNodeByRdfaId(
        this.controller.mainEditorState,
        selectedLiteralNodeId,
      );
      if (!literalNode) {
        return '';
      }
      return (
        (literalNode.value.attrs['defaultDatatype'] as string | null) ?? ''
      );
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
    console.log('get initial lang');
    if (!this.controller) {
      return '';
    }
    if (this.termType === 'LiteralNode') {
      const selectedLiteralNodeId = this.selectedLiteralNode;
      if (!selectedLiteralNodeId) {
        return '';
      }
      const literalNode = getNodeByRdfaId(
        this.controller.mainEditorState,
        selectedLiteralNodeId,
      );
      if (!literalNode) {
        return '';
      }
      return (
        (literalNode.value.attrs['defaultLanguage'] as string | null) ?? ''
      );
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

  get hasImportedResources(): boolean {
    return !!this.args.importedResources;
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
              predicate: formData.get('predicate')?.toString(),
              object: {
                termType: 'NamedNode',
                value: formData.get('object.value')?.toString(),
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
              predicate: formData.get('predicate')?.toString(),
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
            object: { value, language, datatype },
          } = literalNodeSchema.validateSync(
            {
              predicate: formData.get('predicate')?.toString(),
              object: {
                termType: 'LiteralNode',
                value: this.selectedLiteralNode,
                datatype: {
                  termType: 'NamedNode',
                  value:
                    formData.get('object.datatype.value')?.toString() || '',
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
              object: sayDataFactory.literalNode(
                value,
                languageOrDataType(
                  language,
                  sayDataFactory.namedNode(datatype.value),
                ),
              ),
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
              predicate: formData.get('predicate')?.toString(),
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
              predicate: formData.get('predicate')?.toString(),
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
  onSubjectKeydown(select: Select, event: KeyboardEvent) {
    // Based on example from ember-power-select docs, allows for selecting a previously non-existent
    // entry by typing in the power-select 'search' and hitting 'enter'
    if (
      event.key === 'Enter' &&
      select.isOpen &&
      !select.highlighted &&
      !!select.searchText
    ) {
      select.actions.choose(select.searchText);
    }
  }
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
}
