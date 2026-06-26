import {
  type BindingObject,
  executeQuery,
  objectify,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor/utils/sparql-helpers';
import {
  type RoadSignCategory,
  RoadSignCategorySchema,
} from '../schemas/road-sign-category.ts';

type QueryOptions = {
  abortSignal?: AbortSignal;
  roadSignConceptUri?: string;
};

export default async function queryRoadSignCategories(
  endpoint: string,
  options: QueryOptions = {},
) {
  const { abortSignal, roadSignConceptUri } = options;
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT
      ?uri
      ?label
    WHERE {
      ?uri a mobiliteit:Verkeersbordcategorie;
          skos:prefLabel ?label.

      ${roadSignConceptUri ? `${sparqlEscapeUri(roadSignConceptUri)} dct:type ?uri` : ''}
    }
  `;
  const queryResult = await executeQuery<BindingObject<RoadSignCategory>>({
    endpoint,
    query,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  return RoadSignCategorySchema.array().parse(bindings.map(objectify));
}
