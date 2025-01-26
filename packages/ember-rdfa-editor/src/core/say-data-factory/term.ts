import type { Term } from '@rdfjs/types';
import type { ContentLiteralTerm } from './prosemirror-terms/content-literal.ts';
import type { LiteralNodeTerm } from './prosemirror-terms/literal-node.ts';
import type { ResourceNodeTerm } from './prosemirror-terms/resource-node.ts';

export type SayTerm =
  | Term
  | ContentLiteralTerm
  | LiteralNodeTerm
  | ResourceNodeTerm;
