import { type Attrs } from 'prosemirror-model';
import {
  type FullTriple,
  type IncomingTriple,
  type OutgoingTriple,
} from './rdfa-processor.ts';
import { type SayNamedNode } from './say-data-factory/index.ts';

// These types moved here to avoid circular dependencies

export const rdfaNodeTypes = ['resource', 'literal'] as const;
export interface RdfaAwareAttrs {
  __rdfaId: string;
  rdfaNodeType: (typeof rdfaNodeTypes)[number];
  backlinks: IncomingTriple[];
  externalTriples?: FullTriple[];
}
export interface RdfaLiteralAttrs extends RdfaAwareAttrs {
  rdfaNodeType: 'literal';
  content: string | null;
  datatype?: SayNamedNode | null;
  language?: string | null;
}
export interface RdfaResourceAttrs extends RdfaAwareAttrs {
  rdfaNodeType: 'resource';
  externalTriples?: FullTriple[];
  subject: string;
  properties: OutgoingTriple[];
}
export type RdfaAttrs = RdfaLiteralAttrs | RdfaResourceAttrs;

export function isRdfaAttrs(attrs: Attrs): attrs is RdfaAttrs {
  return (
    '__rdfaId' in attrs &&
    'backlinks' in attrs &&
    rdfaNodeTypes.includes(attrs['rdfaNodeType'] as 'resource' | 'literal')
  );
}
