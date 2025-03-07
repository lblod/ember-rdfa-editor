import type { Option } from '#root/utils/_private/option.ts';
import type { SayTerm } from '../term.ts';

/**
 * A term that represents an RDF literal, containing a string with an optional language tag or datatype.
 */
export class LiteralNodeTerm {
  public readonly termType = 'LiteralNode';
  public readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }

  equals = (other?: Option<SayTerm>) => {
    return (
      !!other && other.termType === 'LiteralNode' && other.value === this.value
    );
  };

  toJSON() {
    return {
      termType: this.termType,
      value: this.value,
    };
  }
}
