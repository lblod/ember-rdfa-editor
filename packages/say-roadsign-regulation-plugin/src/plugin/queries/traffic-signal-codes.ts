import {
  executeQuery,
  objectify,
  sparqlEscapeBool,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor/utils/sparql-helpers';
import { TrafficSignalCodeSchema } from '../schemas/traffic-signal-code.ts';

const DEFAULT_SIGNAL_TYPES = [
  'https://data.vlaanderen.be/ns/mobiliteit#Verkeersbordconcept',
  'https://data.vlaanderen.be/ns/mobiliteit#Wegmarkeringconcept',
  'https://data.vlaanderen.be/ns/mobiliteit#Verkeerslichtconcept',
];

type QueryOptions = {
  searchString?: string;
  roadSignCategory?: string;
  types?: string | string[];
  combinedWith?: string | string[];
  abortSignal?: AbortSignal;
};

function buildFilters({
  searchString,
  roadSignCategory,
  types = DEFAULT_SIGNAL_TYPES,
  combinedWith,
}: Omit<QueryOptions, 'abortSignal'>) {
  const categoryFilter = roadSignCategory
    ? `?uri dct:type ${sparqlEscapeUri(roadSignCategory)}`
    : '';
  const typesArray = !Array.isArray(types) ? [types] : types;
  const typeFilter = `
    VALUES ?trafficSignalType {
      ${typesArray.map((type) => sparqlEscapeUri(type)).join(`\n`)}
    }
  `;

  let combinedWithArray: string[];
  if (!Array.isArray(combinedWith)) {
    if (combinedWith) combinedWithArray = [combinedWith];
    else combinedWithArray = [];
  } else {
    combinedWithArray = combinedWith;
  }
  let signFilter = '';
  if (combinedWithArray.length > 0) {
    signFilter = combinedWithArray
      .map(
        (sign) =>
          `${sparqlEscapeUri(sign)} mobiliteit:heeftMaatregelconcept ?measure.`,
      )
      .join('\n');
    signFilter += '\n';
    const commaSeperatedSigns = combinedWithArray
      .map((sign) => `${sparqlEscapeUri(sign)}`)
      .join(',');
    signFilter += `FILTER (?uri NOT IN (${commaSeperatedSigns}))`;
  }

  const searchFilter = searchString
    ? `FILTER(CONTAINS(LCASE(?label), ${sparqlEscapeString(searchString.toLowerCase())}))`
    : '';
  return `
    ${categoryFilter}
    ${typeFilter}
    ${signFilter}
    ${searchFilter}
  `;
}

export default async function queryTrafficSignalCodes(
  endpoint: string,
  options: QueryOptions = {},
) {
  const { abortSignal } = options;
  const filterStatement = buildFilters(options);

  // The sorting here is a little weird. This is to handle labels which are normally of the form
  // 'A1.3b', where the 1.3 should be sorted as a number. There is no enforcement of this format, so
  // we try to handle cases such as 'weird1.2.3LABEL' in a way that is not too broken.
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT
      ?uri
      ?label
    WHERE {
      ?uri mobiliteit:heeftMaatregelconcept ?measure.
      ?uri a ?trafficSignalType;
              skos:prefLabel ?label;
              ext:valid ${sparqlEscapeBool(true)}.
      ${filterStatement}
      BIND(REPLACE(?label, "^(\\\\D+).*", "$1", "i") AS ?firstLetters)
      BIND(xsd:decimal(REPLACE(?label, "^\\\\D+(\\\\d*\\\\.?\\\\d*).*", "$1", "i")) AS ?number)
      BIND(REPLACE(?label, "^\\\\D+\\\\d*\\\\.?\\\\d*(.*)", "$1", "i") AS ?secondLetters)
    }
    ORDER BY ASC(UCASE(?firstLetters)) ASC(?number) ASC(LCASE(?secondLetters))
  `;
  const queryResult = await executeQuery({ endpoint, query, abortSignal });
  const bindings = queryResult.results.bindings;
  return TrafficSignalCodeSchema.array().parse(bindings.map(objectify));
}
