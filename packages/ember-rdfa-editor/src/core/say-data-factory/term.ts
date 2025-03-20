import type { ContentLiteralTerm } from './prosemirror-terms/content-literal.ts';
import type { LiteralNodeTerm } from './prosemirror-terms/literal-node.ts';
import type { ResourceNodeTerm } from './prosemirror-terms/resource-node.ts';
import type { SayNamedNode } from './named-node.ts';
import type { SayLiteral } from './literal.ts';
import type { SayDefaultGraph } from './default-graph.ts';
import type { SayVariable } from './variable.ts';
import type { SayBlankNode } from './blank-node.ts';
import type { SayQuad } from './quad.ts';

export type SayTerm =
  | SayVariable
  | SayNamedNode
  | SayLiteral
  | SayDefaultGraph
  | SayBlankNode
  | SayQuad
  | ContentLiteralTerm
  | LiteralNodeTerm
  | ResourceNodeTerm;
