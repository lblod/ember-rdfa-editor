import { Schema } from 'prosemirror-model';
import {
  DCT,
  RDF,
  SKOS,
  VARIABLES,
} from '#root/utils/_private/lblod-utils/constants.ts';
import { type AllOrNone } from '#root/utils/_private/types.ts';
import {
  type FullTriple,
  type IncomingTriple,
  type OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import { sayDataFactory } from '#root/core/say-data-factory/index.ts';
import type { Option } from '#root/utils/option.ts';

export type CodelistAttrs = {
  label: Option<string>;
  source: Option<string>;
  codelist: Option<string>;
  variable: Option<string>;
  variableInstance: Option<string>;
  selectionStyle: Option<string>;
  hardcodedOptionList: Option<CodeListOption[]>;
};
export type CodeListOption = {
  uri: string;
  label: string;
};

type CreateCodelistVariableArgs = {
  schema: Schema;
  value?: string;
  valueLabel?: string;
} & CreateCodelistVariableAttrsArgs;

export function createCodelistVariable(args: CreateCodelistVariableArgs) {
  const { schema } = args;
  const attrs = createCodelistVariableAttrs(args);
  if (args.value && args.valueLabel) {
    const codelistOption = createCodelistOptionNode({
      schema,
      subject: args.value,
      variableInstance: args.variableInstance,
      text: args.valueLabel,
      pointsToNode: args.__rdfaId,
    });
    return schema.nodes['codelist'].create(attrs, [codelistOption]);
  }
  return schema.nodes['codelist'].create(attrs);
}

type CreateCodelistVariableAttrsArgs = {
  selectionStyle?: 'single' | 'multi';
  label?: string;
  source: string;
  codelist: string;
  hardcodedOptionList?: CodeListOption[];
  hasNonLiteralContents?: boolean;
} & AllOrNone<{
  variable: string;
  variableInstance: string;
  __rdfaId?: string;
}>;

export function createCodelistVariableAttrs({
  selectionStyle,
  label,
  source,
  codelist,
  __rdfaId,
  variable,
  variableInstance,
  hardcodedOptionList,
  hasNonLiteralContents,
}: CreateCodelistVariableAttrsArgs) {
  const externalTriples: FullTriple[] = [];
  if (variable) {
    externalTriples.push(
      {
        subject: sayDataFactory.namedNode(variableInstance),
        predicate: RDF('type').full,
        object: sayDataFactory.namedNode(VARIABLES('VariableInstance').full),
      },
      {
        subject: sayDataFactory.namedNode(variableInstance),
        predicate: VARIABLES('instanceOf').full,
        object: sayDataFactory.namedNode(variable),
      },
      {
        subject: sayDataFactory.namedNode(variableInstance),
        predicate: DCT('type').full,
        object: sayDataFactory.literal('codelist'),
      },
    );
  }

  return {
    rdfaNodeType: 'literal',
    externalTriples,
    selectionStyle,
    source,
    __rdfaId,
    codelist,
    label,
    variable,
    variableInstance,
    hardcodedOptionList,
    hasNonLiteralContents: !!hasNonLiteralContents,
  } as CodelistAttrs;
}

type CreateCodelistOptionNodeArgs = {
  schema: Schema;
  text: string;
} & CreateCodelistOptionNodeAttrsArgs;

export function createCodelistOptionNode(args: CreateCodelistOptionNodeArgs) {
  const { schema, text } = args;
  const attrs = createCodelistOptionNodeAttrs(args);
  return schema.nodes['codelist_option'].create(attrs, schema.text(text));
}

type CreateCodelistOptionNodeAttrsArgs = {
  subject: string;
  text: string;
  value?: string;
  variableInstance?: string;
  pointsToNode?: string;
};

function createCodelistOptionNodeAttrs({
  subject,
  text,
  variableInstance,
  pointsToNode,
}: CreateCodelistOptionNodeAttrsArgs) {
  const backlinks: IncomingTriple[] = [];
  if (variableInstance) {
    backlinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  const properties: OutgoingTriple[] = [
    {
      predicate: SKOS('prefLabel').full,
      object: sayDataFactory.literal(text),
    },
  ];

  return {
    rdfaNodeType: 'resource',
    subject,
    properties,
    backlinks,
    pointsToNode,
  };
}
