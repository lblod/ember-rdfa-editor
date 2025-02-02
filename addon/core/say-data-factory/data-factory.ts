import type * as RDF from '@rdfjs/types';
import { SayNamedNode } from './named-node';
import { SayBlankNode } from './blank-node';
import { SayLiteral } from './literal';
import { SayVariable } from './variable';
import { SayDefaultGraph } from './default-graph';
import { Quad } from 'rdf-data-factory';
import { SayQuad, type SayTerm } from '.';
import { LiteralNodeTerm } from './prosemirror-terms/literal-node';
import { ResourceNodeTerm } from './prosemirror-terms/resource-node';
import { ContentLiteralTerm } from './prosemirror-terms/content-literal';
import { LANG_STRING } from '@lblod/ember-rdfa-editor/utils/_private/constants';
import type { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';

export type WithoutEquals<T extends SayTerm> = Omit<T, 'equals'>;
let dataFactoryCounter = 0;

/**
 * A factory for instantiating Say RDF terms and quads.
 */
export class SayDataFactory<Q extends RDF.BaseQuad = RDF.Quad>
  implements RDF.DataFactory<Q>
{
  private readonly blankNodePrefix: string;
  private blankNodeCounter = 0;

  public constructor(options?: IDataFactoryOptions) {
    options = options || {};
    this.blankNodePrefix =
      options.blankNodePrefix || `df_${dataFactoryCounter++}_`;
  }

  public namedNode<Iri extends string = string>(value: Iri): SayNamedNode<Iri> {
    return new SayNamedNode(value);
  }

  public blankNode(value?: string): SayBlankNode {
    return new SayBlankNode(
      value || `${this.blankNodePrefix}${this.blankNodeCounter++}`,
    );
  }

  public literal(
    value: string,
    languageOrDatatype?: string | RDF.NamedNode,
  ): SayLiteral {
    return new SayLiteral(value, languageOrDatatype);
  }

  public variable(value: string): SayVariable {
    return new SayVariable(value);
  }

  public defaultGraph(): SayDefaultGraph {
    return SayDefaultGraph.INSTANCE;
  }

  public quad(
    subject: Q['subject'],
    predicate: Q['predicate'],
    object: Q['object'],
    graph?: Q['graph'],
  ): Q & Quad {
    return <Q>(
      new SayQuad(subject, predicate, object, graph || this.defaultGraph())
    );
  }

  literalNode(
    value: string,
    languageOrDataType?: string | RDF.NamedNode<string>,
  ): LiteralNodeTerm {
    return new LiteralNodeTerm(value, languageOrDataType);
  }

  resourceNode(value: string): ResourceNodeTerm {
    return new ResourceNodeTerm(value);
  }

  contentLiteral(
    languageOrDataType?: string | RDF.NamedNode<string>,
  ): ContentLiteralTerm {
    return new ContentLiteralTerm(languageOrDataType);
  }

  public fromTerm<T extends WithoutEquals<SayTerm>>(original: T): SayTerm {
    switch (original.termType) {
      case 'NamedNode':
        return this.namedNode(original.value);
      case 'BlankNode':
        return this.blankNode(original.value);
      case 'Literal': {
        const { datatype, language } = original as WithoutEquals<SayLiteral>;
        return this.literal(
          original.value,
          languageOrDataType(language, this.fromTerm(datatype) as SayNamedNode),
        );
      }
      case 'Variable':
        return this.variable(original.value);
      case 'DefaultGraph':
        return this.defaultGraph();
      case 'Quad': {
        const { subject, predicate, object, graph } = original as unknown as Q;
        return this.quad(
          this.fromTerm(subject) as Q['subject'],
          this.fromTerm(predicate) as Q['predicate'],
          this.fromTerm(object) as Q['object'],
          this.fromTerm(graph) as Q['graph'],
        );
      }

      case 'ResourceNode':
        return this.resourceNode(original.value);
      case 'LiteralNode': {
        const { datatype, language } =
          original as WithoutEquals<LiteralNodeTerm>;
        return this.literalNode(
          original.value,
          languageOrDataType(
            language,
            this.fromTerm(datatype) as RDF.NamedNode,
          ),
        );
      }
      case 'ContentLiteral': {
        const { datatype, language } =
          original as WithoutEquals<ContentLiteralTerm>;
        return this.contentLiteral(
          languageOrDataType(
            language,
            this.fromTerm(datatype) as RDF.NamedNode,
          ),
        );
      }
    }
  }

  /**
   * Reset the internal blank node counter.
   */
  public resetBlankNodeCounter(): void {
    this.blankNodeCounter = 0;
  }
}

export interface IDataFactoryOptions {
  blankNodePrefix?: string;
}

export const sayDataFactory = new SayDataFactory();
export function languageOrDataType(
  language?: Option<string>,
  datatype?: Option<RDF.NamedNode>,
): string | RDF.NamedNode | undefined {
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
