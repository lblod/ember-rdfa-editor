import type * as RDF from '@rdfjs/types';
import {
  conciseToRdfjs,
  type PrefixMapping,
} from '@lblod/ember-rdfa-editor/utils/_private/concise-term-string.ts';
import { execPipe, filter, first, flatMap, isEmpty, map } from 'iter-tools';
import type { TermSpec } from '@lblod/ember-rdfa-editor/utils/_private/datastore/term-spec.ts';
import { single } from '../iterator-utils.ts';

/**
 * Utility class to represent a collection of terms with their
 * respective {@link ModelNode ModelNodes}. The nodes per term
 * are in document order and unique (no duplicates per term).
 *
 * There is no meaningful way to define order on the terms,
 * so don't count on consistent ordering between them.
 */
export class TermMapping<T extends RDF.Term, N>
  implements
    Iterable<{
      term: T;
      nodes: N[];
    }>
{
  private termMap: Map<T, N[]>;
  private getPrefix: PrefixMapping;

  constructor(map: Map<T, N[]>, getPrefix: PrefixMapping) {
    this.termMap = map;
    this.getPrefix = getPrefix;
  }

  /**
   * Return the only mapping, if there is one.
   * Throws if there is more than 1 mapping.
   *
   * Saves you from unpacking the iterator
   * when you know for sure there can only be one answer,
   * e.g. you matched on a subject and are requesting subjectNodes
   */
  single(): { term: T; nodes: N[] } | null {
    return (
      single(
        map(
          (entry) => ({
            term: entry[0],
            nodes: entry[1],
          }),
          this.termMap.entries(),
        ),
      ) || null
    );
  }

  [Symbol.iterator]() {
    return map(
      (entry) => ({
        term: entry[0],
        nodes: entry[1],
      }),
      this.termMap.entries(),
    )[Symbol.iterator]();
  }

  /**
   * Request the mapping for a specific term.
   * @param term
   */
  get(term: TermSpec): N[] | null {
    const convertedTerm = (
      typeof term === 'string' ? conciseToRdfjs(term, this.getPrefix) : term
    ) as T;
    return (
      first(
        execPipe(
          this.termMap.entries(),
          filter((entry) => entry[0].equals(convertedTerm)),
          map((entry) => entry[1]),
        ),
      ) || null
    );
  }

  /**
   * Return an iterable that applies mappingFunc for each entry
   * @param mappingFunc
   */
  map<R>(mappingFunc: (entry: { term: T; nodes: N[] }) => R): Iterable<R> {
    return execPipe(
      this.termMap.entries(),
      map((entry) => ({ term: entry[0], nodes: entry[1] })),
      map(mappingFunc),
    );
  }

  nodes(): Iterable<N> {
    return flatMap((entry) => entry[1], this.termMap.entries());
  }

  isEmpty(): boolean {
    return isEmpty(this.termMap.entries());
  }
}
