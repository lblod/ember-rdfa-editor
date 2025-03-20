import type { Option } from '@lblod/ember-rdfa-editor/utils/_private/option.ts';
import type * as RDF from '@rdfjs/types';

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

  equals = (other?: Option<RDF.Term>) => {
    return !!other && other.termType === 'DefaultGraph';
  };
}
