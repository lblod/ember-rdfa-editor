import * as RDF from '@rdfjs/types';
import type {
  ConBlankNode,
  ConLiteral,
  ConNamedNode,
} from '@lblod/ember-rdfa-editor/utils/_private/concise-term-string';

export type TermSpec = SubjectSpec | PredicateSpec | ObjectSpec;
export type SubjectSpec = RDF.Quad_Subject | ConNamedNode | ConBlankNode | null;
export type PredicateSpec = RDF.Quad_Predicate | ConNamedNode | null;
export type ObjectSpec =
  | RDF.Quad_Object
  | ConNamedNode
  | ConBlankNode
  | ConLiteral;
type Primitive = number | string | boolean;

export function isPrimitive(thing: unknown): thing is Primitive {
  return (
    typeof thing === 'string' ||
    typeof thing === 'boolean' ||
    typeof thing === 'number'
  );
}
