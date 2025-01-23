import * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import {
  RDF_TYPE,
  XSD_PREFIX,
} from '@lblod/ember-rdfa-editor/utils/_private/constants';
import { ParseError } from '@lblod/ember-rdfa-editor/utils/_private/errors';

/**
 * This is a simplified implementation of {@link https://graphy.link/concise#string/c1 Concise term syntax}
 */

export type ConciseTerm = ConNamedNode | ConBlankNode | ConLiteral;

export type ConNamedNode = ConAbsoluteIRI | ConPrefixedName | ConTypeAlias;
type ConAbsoluteIRI = `>${string}`;
type ConPrefixedName = `${string}:${string}`;
type ConTypeAlias = 'a';

export type ConBlankNode = `_:${string}`;

export type ConLiteral =
  | ConPlainLiteral
  | ConDatatypedLiteral
  | ConLanguagedLiteral
  | ConImplicitLiteral
  | number
  | boolean;
type ConDatatypedLiteral = `^${string}"${ConPlainLiteral}`;
type ConLanguagedLiteral = `@${string}"${ConPlainLiteral}`;
type ConPlainLiteral = `"${string}`;
type ConImplicitLiteral = string;

export type PrefixMapping = (prefix: string) => string | null;
export type TermConverter = (term: ConciseTerm) => RDF.Term;

export function xsd(type: string): string {
  return `${XSD_PREFIX}${type}`;
}

function splitInTwo(term: string, separator: string): [string, string] | null {
  const splitTerm = term.split(separator);

  if (splitTerm.length < 2) {
    return null;
  }
  const [prefix, ...rest] = splitTerm;
  return [prefix, rest.join(separator)];
}

function toAbsIri(
  prefix: string,
  suffix: string,
  prefixMapping: PrefixMapping,
): string {
  const iri = prefixMapping(prefix);
  if (!iri) {
    throw new ParseError(`Unrecognized prefix: ${prefix}`);
  }
  return `${iri}${suffix}`;
}

/**
 * Convert a {@link ConciseTerm} into an RDFjs-compliant node
 * @param term
 * @param prefixMapping
 */
export function conciseToRdfjs(
  term: ConPrefixedName,
  prefixMapping: PrefixMapping,
): RDF.NamedNode;
export function conciseToRdfjs(
  term: ConAbsoluteIRI,
  prefixMapping?: PrefixMapping,
): RDF.NamedNode;
export function conciseToRdfjs(
  term: ConTypeAlias,
  prefixMapping?: PrefixMapping,
): RDF.NamedNode;
export function conciseToRdfjs(
  term: ConLiteral,
  prefixMapping?: PrefixMapping,
): RDF.Literal;
export function conciseToRdfjs(
  term: ConBlankNode,
  prefixMapping?: PrefixMapping,
): RDF.BlankNode;
export function conciseToRdfjs(
  term: ConciseTerm,
  prefixMapping?: PrefixMapping,
): RDF.Term {
  const factory = new DataFactory();
  if (typeof term === 'number') {
    const numberType = factory.namedNode(xsd('double'));
    return factory.literal(term.toString(10), numberType);
  } else if (typeof term === 'boolean') {
    const boolType = factory.namedNode(xsd('boolean'));
    return factory.literal(String(term), boolType);
  } else {
    if (term === 'a') {
      return factory.namedNode(RDF_TYPE);
    } else {
      const firstChar = term.charAt(0);
      switch (firstChar) {
        case '>': {
          const content = term.substring(1);
          return factory.namedNode(content);
        }
        case '"': {
          const content = term.substring(1);
          return factory.literal(content);
        }
        case '_': {
          if (term.charAt(1) === ':') {
            return factory.blankNode(term.substring(2));
          } else {
            return factory.blankNode();
          }
        }
        case '@': {
          const content = term.substring(1);
          const split = splitInTwo(content, '"');
          if (!split) {
            throw new ParseError(
              `Languaged literal without separator. Got: ${term}`,
            );
          }
          const [language, value] = split;
          return factory.literal(value, language);
        }
        case '^': {
          const content = term.substring(1);
          const split = splitInTwo(content, '"');
          if (!split) {
            throw new ParseError(
              `Datatyped literal without separator. Got: ${term}`,
            );
          }
          const [dataType, value] = split;
          const dataTypeStart = dataType.charAt(0);
          if (dataTypeStart === '>') {
            const dataTypeContent = dataType.substring(1);
            return factory.literal(value, factory.namedNode(dataTypeContent));
          } else {
            const split = splitInTwo(dataType, ':');
            if (!split) {
              throw new ParseError(
                `Invalid datatype spec, either provide an absolute or a prefixed IRI. Got: ${term}`,
              );
            }
            const [prefix, suffix] = split;
            if (!prefixMapping) {
              throw new ParseError(
                'Cannot parse prefixed dataType without prefixMapping',
              );
            }
            return factory.literal(
              value,
              factory.namedNode(toAbsIri(prefix, suffix, prefixMapping)),
            );
          }
        }
        default: {
          const split = splitInTwo(term, ':');
          if (!split) {
            return factory.literal(term);
          } else {
            const [prefix, suffix] = split;
            if (!prefixMapping) {
              throw new ParseError(
                'Cannot parse prefixed name without prefixMapping',
              );
            }
            return factory.namedNode(toAbsIri(prefix, suffix, prefixMapping));
          }
        }
      }
    }
  }
}
