import type { Option } from '@lblod/ember-rdfa-editor/utils/_private/option.ts';
import type * as RDF from '@rdfjs/types';

/**
 * A term that represents a variable.
 */
export class SayVariable implements RDF.Variable {
  public readonly termType = 'Variable';
  public readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }

  equals = (other?: Option<RDF.Term>) => {
    return (
      !!other && other.termType === 'Variable' && other.value === this.value
    );
  };

  toJSON() {
    return {
      termType: this.termType,
      value: this.value,
    };
  }
}
