import type { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type * as RDF from '@rdfjs/types';
import type { SayTerm } from '.';

/**
 * A term that represents a variable.
 */
export class SayVariable implements RDF.Variable {
  public readonly termType = 'Variable';
  public readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }

  equals = (other?: Option<SayTerm>) => {
    return (
      !!other && other.termType === 'Variable' && other.value === this.value
    );
  };
}
