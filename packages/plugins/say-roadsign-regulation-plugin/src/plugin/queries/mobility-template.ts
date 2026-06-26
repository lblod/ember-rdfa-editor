import {
  type BindingObject,
  executeQuery,
  objectify,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor/utils/sparql-helpers';
import {
  type MobilityTemplate,
  MobilityTemplateSchema,
} from '../schemas/mobility-template.ts';

type QueryOptions = {
  instructionVariableUri?: string;
  measureConceptUri?: string;
  abortSignal?: AbortSignal;
};

export async function queryMobilityTemplates(
  endpoint: string,
  options: QueryOptions = {},
) {
  const { instructionVariableUri, measureConceptUri, abortSignal } = options;
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT DISTINCT
      ?uri
      ?value
    WHERE {
      ?uri
        a mobiliteit:Template;
        rdf:value ?value.

      ${
        instructionVariableUri
          ? `${sparqlEscapeUri(instructionVariableUri)} mobiliteit:template ?uri`
          : ''
      }
      ${
        measureConceptUri
          ? `${sparqlEscapeUri(measureConceptUri)} mobiliteit:Mobiliteitsmaatregelconcept.template ?uri`
          : ''
      }
    }
  `;

  const queryResult = await executeQuery<BindingObject<MobilityTemplate>>({
    query,
    endpoint,
    abortSignal,
  });

  const bindings = queryResult.results.bindings;

  return MobilityTemplateSchema.array().parse(bindings.map(objectify));
}
