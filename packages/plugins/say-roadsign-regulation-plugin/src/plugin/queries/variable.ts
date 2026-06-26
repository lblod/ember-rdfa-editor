import {
  type BindingObject,
  executeQuery,
  objectify,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor/utils/sparql-helpers';
import { type Variable, VariableSchema } from '../schemas/variable.ts';

type QueryOptions = {
  templateUri?: string;
  type?: Variable['type'];
  abortSignal?: AbortSignal;
};

export async function queryVariables(
  endpoint: string,
  options: QueryOptions = {},
) {
  const { templateUri, type, abortSignal } = options;
  const query = /* sparql */ `
    PREFIX variables: <http://lblod.data.gift/vocabularies/variables/>
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT
      ?uri
      ?label
      ?type
      ?defaultValue
      ?codelistUri
    WHERE {
      ?uri
        a variables:Variable;
        dct:title ?label;
        dct:type ?type.

      OPTIONAL {
        ?uri variables:defaultValue ?defaultValue.
      }
      OPTIONAL {
        ?uri mobiliteit:codelijst ?codelistUri.
      }
      ${type ? `FILTER(?type = ${sparqlEscapeString(type)})` : ''}
      ${templateUri ? `${sparqlEscapeUri(templateUri)} mobiliteit:variabele ?uri.` : ''}
    }
  `;
  const queryResult = await executeQuery<BindingObject<Variable>>({
    endpoint,
    query,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  return VariableSchema.array().parse(
    bindings.map((binding) => {
      return { ...objectify(binding), source: endpoint };
    }),
  );
}
