import type { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type { SayTerm } from '..';

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
