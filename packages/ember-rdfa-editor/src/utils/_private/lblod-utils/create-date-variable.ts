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
import {
  sayDataFactory,
  SayNamedNode,
} from '#root/core/say-data-factory/index.ts';
import { formatContainsTime } from './date-helpers.ts';

type CreateDateVariableArgs = {
  schema: Schema;
} & CreateDateVariableAttrsArgs;

export function createDateVariable(args: CreateDateVariableArgs) {
  const { schema } = args;
  const attrs = createDateVariableAttrs(args);
  return schema.nodes['date'].create(attrs);
}

type CreateDateVariableAttrsArgs = {
  label?: string;
  value?: string;
  /** @deprecated the `onlyDate` attribute is no longer used. It has been superseded by the usage of `format` and `datatype` */
  onlyDate?: boolean;
  format?: string;
  custom?: boolean;
  customAllowed?: boolean;
} & AllOrNone<{
  variable: string;
  variableInstance: string;
  __rdfaId?: string;
}>;

export function createDateVariableAttrs({
  variable,
  variableInstance,
  __rdfaId,
  label,
  value,
  format,
  custom,
  customAllowed,
}: CreateDateVariableAttrsArgs) {
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
        object: sayDataFactory.literal('date'),
      },
    );
    backlinks.push({
      subject: sayDataFactory.resourceNode(variableInstance),
      predicate: RDF('value').full,
    });
  }
  let datatype: SayNamedNode | undefined;
  if (format) {
    datatype = !formatContainsTime(format)
      ? XSD('date').namedNode
      : XSD('dateTime').namedNode;
  }
  return {
    rdfaNodeType: 'literal',
    datatype: datatype,
    externalTriples,
    backlinks,
    label,
    __rdfaId,
    content: value,
    format,
    customAllowed,
    custom,
  };
}
