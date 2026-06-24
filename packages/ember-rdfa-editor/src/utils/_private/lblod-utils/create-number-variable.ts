import { Schema } from 'prosemirror-model';
import {
  DCT,
  RDF,
  VARIABLES,
  XSD,
} from '#root/utils/_private/lblod-utils/constants.ts';
import { type AllOrNone } from '#root/utils/_private/types.ts';
import {
  type FullTriple,
  type IncomingTriple,
} from '#root/core/rdfa-processor.ts';
import { sayDataFactory } from '#root/core/say-data-factory/index.ts';

type CreateNumberVariableArgs = {
  schema: Schema;
} & CreateNumberVariableAttrsArgs;

export function createNumberVariable(args: CreateNumberVariableArgs) {
  const { schema } = args;
  const attrs = createNumberVariableAttrs(args);
  return schema.nodes['number'].create(attrs);
}

type CreateNumberVariableAttrsArgs = {
  value?: string;
  minimumValue?: number;
  maximumValue?: number;
  writtenNumber?: boolean;
  label?: string;
} & AllOrNone<{
  variable: string;
  variableInstance: string;
  __rdfaId?: string;
}>;

export function createNumberVariableAttrs({
  variable,
  variableInstance,
  __rdfaId,
  label,
  value,
  minimumValue,
  maximumValue,
  writtenNumber = false,
}: CreateNumberVariableAttrsArgs) {
  const externalTriples: FullTriple[] = [];
  const backlinks: IncomingTriple[] = [];
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
        object: sayDataFactory.literal('number'),
      },
    );
    backlinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  return {
    rdfaNodeType: 'literal',
    datatype: XSD('number').namedNode,
    label,
    externalTriples,
    __rdfaId,
    backlinks,
    content: value,
    minimumValue,
    maximumValue,
    writtenNumber,
  };
}
