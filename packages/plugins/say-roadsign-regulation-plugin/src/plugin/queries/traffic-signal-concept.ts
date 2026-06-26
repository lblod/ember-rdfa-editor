import {
  type BindingObject,
  executeQuery,
  objectify,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor/utils/sparql-helpers';
import {
  type TrafficSignalConcept,
  TrafficSignalConceptSchema,
} from '../schemas/traffic-signal-concept.ts';
import queryRoadSignCategories from './road-sign-category.ts';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../constants.ts';

type QueryOptions = {
  imageBaseUrl?: string;
  measureConceptUri: string;
  abortSignal?: AbortSignal;
};

export async function queryTrafficSignalConcepts(
  endpoint: string,
  options: QueryOptions,
) {
  const { imageBaseUrl, measureConceptUri, abortSignal } = options;
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX schema: <http://schema.org/>

    SELECT DISTINCT
      ?uri
      ?type
      ?code
      ?regulatoryNotation
      ?image
      ?position
    WHERE {
      ?uri
        a mobiliteit:Verkeerstekenconcept;
        a ?type;
        skos:prefLabel ?code.
      {
        ${sparqlEscapeUri(measureConceptUri)}
          mobiliteit:heeftVerkeerstekenLijstItem ?listItem.
        ?listItem
          schema:item ?uri;
          schema:position ?position.
      }
      UNION
      {
        ?uri mobiliteit:heeftMaatregelconcept ${sparqlEscapeUri(measureConceptUri)}.
        FILTER NOT EXISTS {
          ${sparqlEscapeUri(measureConceptUri)}
            mobiliteit:heeftVerkeerstekenLijstItem ?listItem.
          ?listItem
            schema:item ?uri.
        }
      }

      OPTIONAL {
        ?uri mobiliteit:grafischeWeergave/ext:hasFile/mu:uuid ?imageId.
        BIND(CONCAT(${sparqlEscapeString(imageBaseUrl ?? '')}, "/files/", ?imageId, "/download") AS ?image)
      }

      OPTIONAL  {
        ?uri ext:regulatoryNotation ?regulatoryNotation.
      }

      VALUES ?type {
        <https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept>
        <https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept>
        <https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept>
      }
    }
  `;
  const queryResult = await executeQuery<BindingObject<TrafficSignalConcept>>({
    query,
    endpoint,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  const concepts = TrafficSignalConceptSchema.array().parse(
    bindings.map((binding) => {
      const objectified = objectify(binding);
      return {
        ...objectified,
        image: objectified.image ?? '',
      };
    }),
  );
  const conceptsWithCategories = await Promise.all(
    concepts.map(async (concept) => {
      if (concept.type === TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) {
        const categories = await queryRoadSignCategories(endpoint, {
          roadSignConceptUri: concept.uri,
        });
        return {
          ...concept,
          categories,
        };
      } else {
        return concept;
      }
    }),
  );
  return conceptsWithCategories;
}
