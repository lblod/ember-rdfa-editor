import {
  SayLiteral,
  SayNamedNode,
  SayBlankNode,
  ResourceNodeTerm,
  LiteralNodeTerm,
  ContentLiteralTerm,
} from './say-data-factory/index.ts';

export type SayTermType =
  | 'NamedNode'
  | 'Literal'
  | 'LiteralNode'
  | 'ResourceNode'
  | 'ContentLiteral'
  | 'BlankNode';

export interface LiteralTriple {
  predicate: string;
  object: SayLiteral;
}
export interface NamedNodeTriple {
  predicate: string;
  object: SayNamedNode;
}
export interface BlankNodeTriple {
  predicate: string;
  object: SayBlankNode;
}
export interface ResourceNodeTriple {
  predicate: string;
  object: ResourceNodeTerm;
}
export interface LiteralNodeTriple {
  predicate: string;
  object: LiteralNodeTerm;
}
export type ContentTriple = {
  predicate: string;
  object: ContentLiteralTerm;
};

export type PlainTriple = LiteralTriple | NamedNodeTriple | BlankNodeTriple;
export type LinkTriple = ResourceNodeTriple | LiteralNodeTriple;
export type OutgoingTriple =
  | LiteralTriple
  | NamedNodeTriple
  | BlankNodeTriple
  | ResourceNodeTriple
  | LiteralNodeTriple
  | ContentTriple;

export type IncomingTriple = {
  subject: ResourceNodeTerm;
  predicate: string;
};
export type IncomingLiteralTriple = IncomingTriple & {
  language?: string;
  datatype?: string;
};

export type FullTriple = {
  subject: SayNamedNode;
  predicate: string;
  object: SayNamedNode | SayLiteral;
};

export function isLinkTriple(triple: OutgoingTriple): triple is LinkTriple {
  return ['ResourceNode', 'LiteralNode'].includes(triple.object.termType);
}
