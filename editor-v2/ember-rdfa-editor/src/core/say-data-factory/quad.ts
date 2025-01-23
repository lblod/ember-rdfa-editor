import type * as RDF from '@rdfjs/types';
import type { Option } from '#root/utils/_private/option';
import type { SayTerm } from '.';

/**
 * An instance of DefaultGraph represents the default graph.
 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
 */
export class SayQuad implements RDF.BaseQuad {
  public readonly termType = 'Quad';
  public readonly value = '';

  public constructor(
    public readonly subject: RDF.Term,
    public readonly predicate: RDF.Term,
    public readonly object: RDF.Term,
    public readonly graph: RDF.Term,
  ) {}

  equals = (other?: Option<SayTerm>) => {
    // `|| !other.termType` is for backwards-compatibility with old factories without RDF* support.
    return (
      !!other &&
      (other.termType === 'Quad' || !other.termType) &&
      this.subject.equals(other.subject) &&
      this.predicate.equals(other.predicate) &&
      this.object.equals(other.object) &&
      this.graph.equals(other.graph)
    );
  };
}
