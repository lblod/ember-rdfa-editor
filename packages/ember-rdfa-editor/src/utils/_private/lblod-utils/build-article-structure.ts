import { Schema } from 'prosemirror-model';
import { ELI, PROV, RDF } from '#root/utils/_private/lblod-utils/constants.ts';
import {
  type IncomingTriple,
  type OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import { SayDataFactory } from '#root/core/say-data-factory/index.ts';
import { v4 as uuid } from 'uuid';
import {
  DECISION_ARTICLE,
  type StructurePluginOptions,
  type StructureConfig,
} from './structure-types.ts';

export function generateStructureAttrs({
  config,
  subject,
  properties = [],
  backlinks,
}: {
  config: StructureConfig;
  subject: string;
  // TODO Remove these and also link decision structures using relationship combinators
  properties?: OutgoingTriple[];
  backlinks?: IncomingTriple[];
}) {
  const factory = new SayDataFactory();
  return {
    rdfaNodeType: 'resource',
    properties: [
      {
        predicate: RDF('type').full,
        object: factory.namedNode(config.rdfType.full),
      },
      ...properties,
    ] satisfies OutgoingTriple[],
    backlinks,
    hasTitle: config.hasTitle,
    structureType: config.structureType,
    headerTag: config.headerTag,
    headerFormat: config.headerFormat,
    romanize: config.romanize,
    subject,
  };
}

// TODO this should be done using linking tools rather than manually creating properties and
// backlinks. This would bring it more in line with the article-structure structures.
export function buildArticleStructure(
  schema: Schema,
  uriGenerator: StructurePluginOptions['uriGenerator'] = 'template-uuid4',
  /**
   * Adds a backlink to this resource instead of relying on being linked to the decision after
   * creation.
   * Adding backlinks like this does not play nice with the RDFa tools, but if combined with a
   * document with this URI imported it works as expected. It creates valid RDFa in either case.
   */
  decisionUri?: string,
) {
  const factory = new SayDataFactory();
  let articleResource: string;
  if (typeof uriGenerator === 'function') {
    articleResource = uriGenerator('article');
  } else {
    const articleId = uuid();
    articleResource = `http://data.lblod.info/artikels/${uriGenerator === 'template-uuid4' ? '--ref-uuid4-' : ''}${articleId}`;
  }
  return schema.node(
    'structure',
    generateStructureAttrs({
      config: DECISION_ARTICLE,
      subject: articleResource,
      properties: [
        {
          predicate: PROV('value').full,
          object: factory.contentLiteral(),
        },
      ] satisfies OutgoingTriple[],
      //TODO: we should move this logic of adding the backlink to the `insertArticle` transaction-monad
      backlinks: !decisionUri
        ? undefined
        : [
            {
              subject: factory.resourceNode(decisionUri),
              predicate: ELI('has_part').full,
            },
          ],
    }),
    schema.node(
      'paragraph',
      {},
      schema.node('placeholder', { placeholderText: 'Voeg inhoud artikel in' }),
    ),
  );
}
