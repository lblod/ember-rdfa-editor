import type * as RDF from '@rdfjs/types';
import type { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';
import type { SayTerm } from '.';

/**
 * A term that represents an RDF blank node with a label.
 */
export class SayBlankNode implements RDF.BlankNode {
  public readonly termType = 'BlankNode';
  public readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }

  equals = (other?: Option<SayTerm>) => {
    return (
      !!other && other.termType === 'BlankNode' && other.value === this.value
    );
  };
}
