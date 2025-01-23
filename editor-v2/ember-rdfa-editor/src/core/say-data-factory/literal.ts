import type * as RDF from '@rdfjs/types';
import { SayNamedNode } from './named-node.ts';
import type { Option } from '#root/utils/_private/option.ts';
import type { SayTerm } from './index.ts';

/**
 * A term that represents an RDF literal, containing a string with an optional language tag or datatype.
 */
export class SayLiteral implements RDF.Literal {
  public readonly termType = 'Literal';
  public readonly value: string;
  public readonly language: string;
  public readonly datatype: RDF.NamedNode;

  public static readonly RDF_LANGUAGE_STRING: RDF.NamedNode = new SayNamedNode(
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
  );

  public static readonly XSD_STRING: RDF.NamedNode = new SayNamedNode(
    'http://www.w3.org/2001/XMLSchema#string',
  );

  public constructor(
    value: string,
    languageOrDatatype?: string | RDF.NamedNode,
  ) {
    this.value = value;
    if (typeof languageOrDatatype === 'string') {
      this.language = languageOrDatatype;
      this.datatype = SayLiteral.RDF_LANGUAGE_STRING;
    } else if (languageOrDatatype) {
      this.language = '';
      this.datatype = languageOrDatatype;
    } else {
      this.language = '';
      this.datatype = SayLiteral.XSD_STRING;
    }
  }

  equals = (other?: Option<SayTerm>) => {
    return (
      !!other &&
      other.termType === 'Literal' &&
      other.value === this.value &&
      other.language === this.language &&
      this.datatype.equals(other.datatype)
    );
  };
}
