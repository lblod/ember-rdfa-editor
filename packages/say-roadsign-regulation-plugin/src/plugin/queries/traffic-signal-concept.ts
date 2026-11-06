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
import queryTrafficSignalInstructions from './traffic-signal-instructions.ts';

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
      ?mainSign
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

      OPTIONAL  {
        ?mainSign mobiliteit:heeftOnderbordConcept ?uri.
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
  const conceptsWithCategoriesAndMainSigns = await Promise.all(
    concepts.map(async (concept) => {
      if (concept.type === TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) {
        const categories = await queryRoadSignCategories(endpoint, {
          roadSignConceptUri: concept.uri,
        });
        const mainSigns = await queryRoadSignMainSign(endpoint, {
          roadSignConceptUri: concept.uri,
        });
        const instructions = await queryTrafficSignalInstructions(endpoint, {
          roadSignConceptUri: concept.uri,
        });
        return {
          ...concept,
          categories,
          mainSigns,
          instructions,
        };
      } else {
        return concept;
      }
    }),
  );

  return conceptsWithCategoriesAndMainSigns;
}

type MainSignUriBinding = {
  mainSign: string;
};

type MainSignQueryOptions = {
  abortSignal?: AbortSignal;
  roadSignConceptUri?: string;
};

async function queryRoadSignMainSign(
  endpoint: string,
  options: MainSignQueryOptions = {},
) {
  const { abortSignal, roadSignConceptUri } = options;
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT
      ?mainSign
    WHERE {
      ?mainSign mobiliteit:heeftMogelijkOnderbord ${roadSignConceptUri ? sparqlEscapeUri(roadSignConceptUri) : ''}.

    }
  `;
  const queryResult = await executeQuery<BindingObject<MainSignUriBinding>>({
    endpoint,
    query,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  return bindings.map((binding) => binding.mainSign.value);
}
