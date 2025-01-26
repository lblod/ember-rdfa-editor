import type { Option } from '#root/utils/_private/option.ts';
import type * as RDF from '@rdfjs/types';
import type { SayTerm } from './term.ts';

/**
 * A singleton term instance that represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
export class SayDefaultGraph implements RDF.DefaultGraph {
  public static INSTANCE = new SayDefaultGraph();

  public readonly termType = 'DefaultGraph';
  public readonly value = '';

  private constructor() {
    // Private constructor
  }

  equals = (other?: Option<SayTerm>) => {
    return !!other && other.termType === 'DefaultGraph';
  };
}
