import type * as RDF from '@rdfjs/types';
import type { SayTerm } from '.';
import type { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';

/**
 * A term that contains an IRI.
 */
export class SayNamedNode<Iri extends string = string>
  implements RDF.NamedNode<Iri>
{
  public readonly termType = 'NamedNode';
  public readonly value: Iri;

  public constructor(value: Iri) {
    this.value = value;
  }

  equals = (other?: Option<SayTerm>) => {
    return (
      !!other && other.termType === 'NamedNode' && other.value === this.value
    );
  };
}
