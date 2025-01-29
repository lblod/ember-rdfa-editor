import type { Option } from '#root/utils/_private/option.ts';
import type * as RDF from '@rdfjs/types';
import type { SayTerm } from './term.ts';

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
