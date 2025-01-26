import type { Option } from '#root/utils/_private/option.ts';
import type { SayTerm } from '../term.ts';

/**
 * A term that contains an IRI.
 */
export class ResourceNodeTerm<Iri extends string = string> {
  public readonly termType = 'ResourceNode';
  public readonly value: Iri;

  public constructor(value: Iri) {
    this.value = value;
  }

  equals = (other?: Option<SayTerm>) => {
    return (
      !!other && other.termType === 'ResourceNode' && other.value === this.value
    );
  };
}
