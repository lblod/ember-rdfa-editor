import type {
  Literal,
  NamedNode,
  Term,
  BlankNode,
  DefaultGraph,
  Variable,
} from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { Option } from '../utils/_private/option';
import { LANG_STRING } from '../utils/_private/constants';

export interface SayDefaultGraph extends DefaultGraph {
  equals(other?: Option<SayTerm>): boolean;
}
export interface SayVariable extends Variable {
  equals(other?: Option<SayTerm>): boolean;
}
export interface SayLiteral extends Literal {
  equals(other?: Option<SayTerm>): boolean;
}
export interface SayNamedNode<S extends string = string> extends NamedNode<S> {
  equals(other?: Option<SayTerm>): boolean;
}
export interface SayBlankNode extends BlankNode {
  equals(other?: Option<SayTerm>): boolean;
}

export interface LiteralNodeTerm {
  termType: 'LiteralNode';
  value: string;
  datatype: NamedNode;
  language: string;
}
export interface ResourceNodeTerm {
  termType: 'ResourceNode';
  value: string;
}
export interface ContentLiteralTerm {
  termType: 'ContentLiteral';
  value: '';
  datatype: NamedNode;
  language: string;
}
export type SayTerm =
  | Term
  | LiteralNodeTerm
  | ResourceNodeTerm
  | ContentLiteralTerm;

export class SayDataFactory extends DataFactory {
  blankNode(value?: string | undefined): SayBlankNode {
    return super.blankNode(value);
  }
  contentLiteral(
    languageOrDataType?: string | SayNamedNode<string>,
  ): ContentLiteralTerm {
    // TODO: we need to be careful with using spread operators here:
    // the `equals` prototype method is not preserved.
    return {
      ...this.literal('', languageOrDataType),
      value: '',
      termType: 'ContentLiteral',
    };
  }
  defaultGraph(): SayDefaultGraph {
    return super.defaultGraph();
  }
  namedNode<Iri extends string = string>(value: Iri): SayNamedNode<Iri> {
    return super.namedNode(value);
  }
  literal(
    value: string,
    languageOrDatatype?: string | SayNamedNode<string> | undefined,
  ): SayLiteral {
    return super.literal(value, languageOrDatatype);
  }
  literalNode(
    value: string,
    languageOrDataType?: string | SayNamedNode<string>,
  ): LiteralNodeTerm {
    // TODO: we need to be careful with using spread operators here:
    // the `equals` prototype method is not preserved.
    return {
      ...this.literal(value, languageOrDataType),
      termType: 'LiteralNode',
    };
  }
  resourceNode(value: string): ResourceNodeTerm {
    // TODO: we need to be careful with using spread operators here:
    // the `equals` prototype method is not preserved.
    return { ...this.namedNode(value), termType: 'ResourceNode' };
  }
  variable(value: string): SayVariable {
    return super.variable(value);
  }
}

export const sayDataFactory = new SayDataFactory();
export function languageOrDataType(
  language?: Option<string>,
  datatype?: Option<SayNamedNode>,
): string | SayNamedNode | undefined {
  if (language?.length) {
    if (datatype && datatype.value.length) {
      if (datatype.equals(sayDataFactory.namedNode(LANG_STRING))) {
        return language.toLowerCase();
      } else {
        return datatype;
      }
    } else {
      return language.toLowerCase();
    }
  } else if (datatype) {
    return datatype;
  }
  return undefined;
}
