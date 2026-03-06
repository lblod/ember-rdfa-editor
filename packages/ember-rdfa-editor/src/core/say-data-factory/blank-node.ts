import type * as RDF from '@rdfjs/types';
import type { Option } from '#root/utils/_private/option.ts';
import type { SayTerm } from './term.ts';

/**
 * A term that represents an RDF blank node with a label.
 */
export class SayBlankNode implements RDF.BlankNode {
  public readonly termType = 'BlankNode';
  public readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }

  equals(other?: Option<SayTerm>) {
    return (
      !!other && other.termType === 'BlankNode' && other.value === this.value
    );
  }

  toJSON() {
    return {
      termType: this.termType,
      value: this.value,
    };
  }
}
