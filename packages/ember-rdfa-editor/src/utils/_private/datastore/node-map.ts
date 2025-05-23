import type { Quad_Subject, Quad_Predicate, NamedNode } from '@rdfjs/types';
import { TwoWayMap } from '../map-utils.ts';
import type { IncomingTriple } from '#root/core/rdfa-processor.ts';

export interface SubAndContentPred {
  subject: Quad_Subject;
  contentPredicate?: Quad_Predicate;
  contentDatatype?: NamedNode;
  contentLanguage?: string;
}
export type RdfaResourceNodeMap<N> = TwoWayMap<N, SubAndContentPred, N, string>;
export type RdfaContentNodeMap<N> = TwoWayMap<N, IncomingTriple, N, string>;
export function rdfaResourceNodeMap<N>(
  init?: Iterable<[N, SubAndContentPred]>,
): RdfaResourceNodeMap<N> {
  return TwoWayMap.withValueStringHashing<N, SubAndContentPred>({
    valueHasher: (item) => `${item.subject.termType}-${item.subject.value}`,
    init,
  });
}
export function rdfaContentNodeMap<N>(
  init?: Iterable<[N, IncomingTriple]>,
): RdfaContentNodeMap<N> {
  return TwoWayMap.withValueStringHashing<N, IncomingTriple>({
    valueHasher: ({ subject: { termType, value }, predicate }) => {
      return `${termType}-${value}-${predicate}`;
    },
    init,
  });
}
