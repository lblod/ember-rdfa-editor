import type { Quad_Subject, Quad_Predicate, NamedNode } from '@rdfjs/types';
import { TwoWayMap } from '../map-utils.ts';
import type { Literal } from 'rdf-data-factory';

export interface SubAndContentPred {
  subject: Quad_Subject;
  contentPredicate?: Quad_Predicate;
  contentDatatype?: NamedNode;
  contentLanguage?: string;
}
type RdfaContentNodeMapEntry = {
  subject: NamedNode<string>;
  predicate: NamedNode<string>;
  object: Literal;
};
export type RdfaResourceNodeMap<N> = TwoWayMap<N, SubAndContentPred, N, string>;
export type RdfaContentNodeMap<N> = TwoWayMap<
  N,
  RdfaContentNodeMapEntry,
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
  init?: Iterable<[N, RdfaContentNodeMapEntry]>,
): RdfaContentNodeMap<N> {
  return TwoWayMap.withValueStringHashing<N, RdfaContentNodeMapEntry>({
    valueHasher: ({ subject, predicate, object }) => {
      return `${subject.value}__${predicate.value}__${object.value}${object.language ? `@${object.language.toLowerCase()}` : ''}^^${object.datatype.value}`;
    },
    init,
  });
}
