import type { Quad_Subject, Quad_Predicate, NamedNode } from '@rdfjs/types';
import type { IncomingLiteralNodeTriple } from '#root/core/rdfa-processor.ts';
import { TwoWayMap } from '../map-utils.ts';

export interface SubAndContentPred {
  subject: Quad_Subject;
  contentPredicate?: Quad_Predicate;
  contentDatatype?: NamedNode;
  contentLanguage?: string;
}
export type RdfaResourceNodeMap<N> = TwoWayMap<N, SubAndContentPred, N, string>;
export type RdfaContentNodeMap<N> = TwoWayMap<
  N,
  IncomingLiteralNodeTriple,
  N,
  string
>;
export function rdfaResourceNodeMap<N>(
  init?: Iterable<[N, SubAndContentPred]>,
): RdfaResourceNodeMap<N> {
  return TwoWayMap.withValueStringHashing<N, SubAndContentPred>({
    valueHasher: (item) => `${item.subject.termType}-${item.subject.value}`,
    init,
  });
}
export function rdfaContentNodeMap<N>(
  init?: Iterable<[N, IncomingLiteralNodeTriple]>,
): RdfaContentNodeMap<N> {
  return TwoWayMap.withValueStringHashing<N, IncomingLiteralNodeTriple>({
    valueHasher: ({ subject: { termType, value }, predicate }) => {
      return `${termType}-${value}-${predicate}`;
    },
    init,
  });
}
