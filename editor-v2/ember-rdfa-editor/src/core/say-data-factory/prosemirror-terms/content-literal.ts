import type * as RDF from '@rdfjs/types';
import { SayNamedNode } from '../named-node.ts';
import type { Option } from '#root/utils/_private/option.ts';
import type { SayTerm } from '../index.ts';

/**
 * A term that represents an RDF literal, containing a string with an optional language tag or datatype.
 */
export class ContentLiteralTerm {
  public readonly termType = 'ContentLiteral';
  public readonly language: string;
  public readonly datatype: RDF.NamedNode;
  public readonly value = '';

  public static readonly RDF_LANGUAGE_STRING = new SayNamedNode(
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
  );

  public static readonly XSD_STRING = new SayNamedNode(
    'http://www.w3.org/2001/XMLSchema#string',
  );

  public constructor(languageOrDatatype?: string | RDF.NamedNode) {
    if (typeof languageOrDatatype === 'string') {
      this.language = languageOrDatatype;
      this.datatype = ContentLiteralTerm.RDF_LANGUAGE_STRING;
    } else if (languageOrDatatype) {
      this.language = '';
      this.datatype = languageOrDatatype;
    } else {
      this.language = '';
      this.datatype = ContentLiteralTerm.XSD_STRING;
    }
  }

  equals = (other?: Option<SayTerm>) => {
    return (
      !!other &&
      other.termType === 'ContentLiteral' &&
      other.language === this.language &&
      this.datatype.equals(other.datatype)
    );
  };
}
