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

type CreateTextVariableArgs = {
  schema: Schema;
  value?: string;
} & CreateTextVariableAttrsArgs;

export function createTextVariable(args: CreateTextVariableArgs) {
  const { schema, value, label } = args;
  return schema.nodes['text_variable'].create(
    createTextVariableAttrs(args),
    value
      ? schema.text(value)
      : schema.node('placeholder', {
          placeholderText: label,
        }),
  );
}

type CreateTextVariableAttrsArgs = { label?: string } & AllOrNone<{
  variable: string;
  variableInstance: string;
  __rdfaId?: string;
}>;

export function createTextVariableAttrs({
  label,
  variable,
  variableInstance,
  __rdfaId,
}: CreateTextVariableAttrsArgs) {
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
        object: sayDataFactory.literal('text'),
      },
    );
    backlinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  return {
    rdfaNodeType: 'literal',
    datatype: XSD('string').namedNode,
    __rdfaId,
    label,
    backlinks,
    externalTriples,
  };
}
