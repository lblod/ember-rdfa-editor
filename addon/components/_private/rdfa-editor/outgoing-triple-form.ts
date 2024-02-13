import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SayController } from '@lblod/ember-rdfa-editor';
import type {
  OutgoingTriple,
  SayTermType,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  languageOrDataType,
  sayDataFactory,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  getNodeByRdfaId,
  getSubjects,
  rdfaInfoPluginKey,
} from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { localCopy } from 'tracked-toolbox';
import { ValidationError, object, string } from 'yup';

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

interface Args {
  triple: OutgoingTriple;
  termTypes?: SupportedTermType[];
  defaultTermType?: SupportedTermType;
  controller?: SayController;
  onInput?(newTriple: Partial<OutgoingTriple>): void;
  onSubmit?(newTriple: OutgoingTriple): void;
}
const datatypeSchema = object({
  termType: string<'NamedNode'>().required(),
  value: string().curie({ allowEmpty: true }).default(''),
});
const namedNodeSchema = object({
  predicate: string().curie().required(),
  object: object({
    termType: string<'NamedNode'>().required(),
    value: string().curie().required(),
  }),
});
const literalSchema = object({
  predicate: string().curie().required(),
  object: object({
    termType: string<'Literal'>().required(),
    value: string().required(),
    datatype: datatypeSchema,
    language: string().default(''),
  }),
});
const literalNodeSchema = object({
  predicate: string().curie().required(),
  object: object({
    termType: string().oneOf(['LiteralNode']).required(),
    value: string().required(),
    datatype: datatypeSchema,
    language: string().default(''),
  }),
});
const resourceNodeSchema = object({
  predicate: string().curie().required(),
  object: object({
    termType: string<'ResourceNode'>().required(),
    value: string().curie().required(),
  }),
});
const contentLiteralSchema = object({
  predicate: string().curie().required(),
  object: object({
    termType: string<'ContentLiteral'>().required(),
    datatype: datatypeSchema,
    language: string().default(''),
  }),
});

const DEFAULT_TRIPLE: OutgoingTriple = {
  predicate: '',
  object: sayDataFactory.namedNode(''),
};
export default class OutgoingTripleFormComponent extends Component<Args> {
  @localCopy('args.triple.object.termType')
  selectedTermType?: SayTermType;

  @localCopy('args.triple.object.value')
  linkedResourceNode?: string;

  @localCopy('args.triple.object.value')
  linkedLiteralNode?: string;

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
    return getSubjects(this.controller.mainEditorState);
  }

  get initialDatatypeValue(): string {
    const termType = this.triple.object.termType;
    if (
      termType === 'Literal' ||
      termType === 'ContentLiteral' ||
      termType === 'LiteralNode'
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
    | { valid: true; triple: OutgoingTriple }
    | { valid: false; errors: ValidationError[] } {
    try {
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
                  sayDataFactory.namedNode(object.datatype.value),
                ),
              ),
            },
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
      this.args.onSubmit?.(validated.triple);
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
