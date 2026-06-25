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

type CreateClassicLocationVariableArgs = {
  schema: Schema;
  value?: string;
} & CreateClassicLocationVariableAttrsArgs;

export function createClassicLocationVariable(
  args: CreateClassicLocationVariableArgs,
) {
  const { schema } = args;
  const attrs = createClassicLocationVariableAttrs(args);
  return schema.nodes['block_rdfa'].create(
    attrs,
    schema.nodes['paragraph'].create(),
  );
}

type CreateClassicLocationVariableAttrsArgs = {
  label?: string;
  source?: string;
  backlinks?: IncomingTriple[];
} & AllOrNone<{
  variable: string;
  variableInstance: string;
  __rdfaId?: string;
}>;

export function createClassicLocationVariableAttrs({
  variable,
  variableInstance,
  __rdfaId,
  label,
  source,
  backlinks = [],
}: CreateClassicLocationVariableAttrsArgs) {
  const externalTriples: FullTriple[] = [];
  const addedBacklinks: IncomingTriple[] = [];
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
    if (source) {
      externalTriples.push({
        subject: sayDataFactory.namedNode(variableInstance),
        predicate: DCT('source').full,
        object: sayDataFactory.namedNode(source),
      });
    }
    addedBacklinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  return {
    rdfaNodeType: 'literal',
    datatype: XSD('string').namedNode,
    __rdfaId,
    externalTriples,
    backlinks: [...backlinks, ...addedBacklinks],
    label: label ?? 'Plaatsbeschrijving',
    source,
  };
}
