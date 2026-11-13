import {
  type BindingObject,
  executeQuery,
  objectify,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor/utils/sparql-helpers';
import { InstructionSchema, type Instruction } from '../schemas/instruction.ts';

type QueryOptions = {
  abortSignal?: AbortSignal;
  roadSignConceptUri?: string;
};

export default async function queryTrafficSignalInstructions(
  endpoint: string,
  options: QueryOptions = {},
) {
  const { abortSignal, roadSignConceptUri } = options;
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT DISTINCT
      ?uri
      ?value
      ?preview
    WHERE {
      ?uri a mobiliteit:Template;
          rdf:value ?value;
          ext:preview ?preview.

      ${roadSignConceptUri ? `${sparqlEscapeUri(roadSignConceptUri)} mobiliteit:heeftInstructie ?uri` : ''}
    }
  `;
  const queryResult = await executeQuery<BindingObject<Instruction>>({
    endpoint,
    query,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  return InstructionSchema.array().parse(bindings.map(objectify));
}
