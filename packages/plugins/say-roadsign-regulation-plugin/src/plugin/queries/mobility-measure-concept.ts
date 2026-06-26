import {
  executeQuery,
  objectify,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor/utils/sparql-helpers';
import {
  type MobilityMeasureConcept,
  MobilityMeasureConceptSchema,
} from '../schemas/mobility-measure-concept.ts';
import { z } from 'zod';
import { queryTrafficSignalConcepts } from './traffic-signal-concept.ts';
import {
  getLegacyZonalityUri,
  getNewZonalityUri,
  type LegacyZonalityUri,
  ZONALITY_OPTIONS,
  type ZonalityUri,
} from '../constants.ts';

type QueryOptions<Count extends boolean = boolean> = {
  imageBaseUrl?: string;
  searchString?: string;
  zonality?: (typeof ZONALITY_OPTIONS)[keyof typeof ZONALITY_OPTIONS];
  trafficSignalType?: string;
  codes?: string[];
  category?: string;
  page?: number;
  pageSize?: number;
  abortSignal?: AbortSignal;
  count: Count;
};

type Result<Count extends boolean> = Count extends true
  ? number
  : MobilityMeasureConcept[];

function _buildFilters(
  options: Omit<QueryOptions, 'page' | 'pageSize' | 'abortSignal' | 'count'>,
) {
  const { zonality, trafficSignalType, codes, category, searchString } =
    options;
  const filters = [];
  if (zonality) {
    filters.push(
      `FILTER(?zonality IN (
        ${sparqlEscapeUri(zonality)},
        ${sparqlEscapeUri(getLegacyZonalityUri(zonality))},
        ${sparqlEscapeUri(ZONALITY_OPTIONS.POTENTIALLY_ZONAL)},
        ${sparqlEscapeUri(getLegacyZonalityUri(ZONALITY_OPTIONS.POTENTIALLY_ZONAL))}
        )
      )`,
    );
  }
  if (trafficSignalType) {
    filters.push(
      `FILTER(?trafficSignalType = ${sparqlEscapeUri(trafficSignalType)})`,
    );
  }
  if (codes) {
    filters.push(`
        ${codes
          .map(
            (uri) => `
              ${sparqlEscapeUri(uri)} mobiliteit:heeftMaatregelconcept ?uri.
            `,
          )
          .join(' ')}
    `);
  }
  if (category) {
    filters.push(`FILTER(?signClassification = ${sparqlEscapeUri(category)})`);
  }

  if (searchString) {
    filters.push(
      `
      FILTER(BOUND(?preview))
      FILTER(CONTAINS(UCASE(STR(?preview)), UCASE(${sparqlEscapeString(searchString)})))`,
    );
  }
  return filters;
}

async function _queryMobilityMeasures<Count extends boolean>(
  endpoint: string,
  options: QueryOptions<Count>,
): Promise<Result<Count>> {
  const { page = 0, pageSize = 10, count, imageBaseUrl, abortSignal } = options;
  const selectStatement = count
    ? /* sparql */ `SELECT (COUNT(DISTINCT(?uri)) AS ?count)`
    : /* sparql */ `SELECT DISTINCT ?uri ?label ?preview ?zonality ?variableSignage`;
  const groupByStatement = !count
    ? /* sparql */ `GROUP BY ?uri ?label ?firstLetters ?number ?secondLetters ?preview ?zonality ?variableSignage`
    : '';

  const filterStatement = _buildFilters(options).join('\n');
  const orderBindings = !count
    ? `
      BIND(REPLACE(?label, "^(\\\\D+).*", "$1", "i") AS ?firstLetters)
      BIND(xsd:decimal(REPLACE(?label, "^\\\\D+(\\\\d*\\\\.?\\\\d*).*", "$1", "i")) AS ?number)
      BIND(REPLACE(?label, "^\\\\D+\\\\d*\\\\.?\\\\d*(.*)", "$1", "i") AS ?secondLetters)
    `
    : '';
  const orderByStatement = !count
    ? /* sparql */ `ORDER BY ASC(COUNT(DISTINCT ?signConceptItem)) ASC(UCASE(?firstLetters)) ASC(?number) ASC(LCASE(?secondLetters))`
    : '';
  const paginationStatement = !count
    ? /* sparql */ `LIMIT ${pageSize} OFFSET ${page * pageSize}`
    : '';
  const query = /* sparql */ `
    PREFIX mobiliteit: <https://data.vlaanderen.be/ns/mobiliteit#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX dct: <http://purl.org/dc/terms/>

    ${selectStatement}
    WHERE {
      ?uri
        a mobiliteit:Mobiliteitmaatregelconcept;
        skos:prefLabel ?label;
        ext:zonality ?zonality;
        mobiliteit:heeftVerkeerstekenLijstItem ?signConceptItem ;
        mobiliteit:Mobiliteitsmaatregelconcept.template ?templateUri.

      ?templateUri ext:preview ?preview.

      ?signUri
        a ?trafficSignalType;
        mobiliteit:heeftMaatregelconcept ?uri;
        skos:prefLabel ?signCode.

      OPTIONAL {
        ?uri mobiliteit:variabeleSignalisatie ?variableSignage.
      }
      OPTIONAL {
        ?signUri dct:type ?signClassification.
      }
      ${filterStatement}
      ${orderBindings}
    }
    ${groupByStatement}
    ${orderByStatement}
    ${paginationStatement}
  `;

  const queryResult = await executeQuery({
    query,
    endpoint,
    abortSignal,
  });
  const bindings = queryResult.results.bindings;
  if (count) {
    // @ts-expect-error don't know how to fix this error
    return z.number({ coerce: true }).parse(bindings[0].count.value);
  } else {
    const concepts = MobilityMeasureConceptSchema.array().parse(
      bindings.map((binding) => {
        const objectified = objectify(binding);
        return {
          ...objectified,
          variableSignage:
            objectified['variableSignage'] === '1' ||
            objectified['variableSignage'] === 'true',
          zonality: getNewZonalityUri(
            objectified['zonality'] as ZonalityUri | LegacyZonalityUri,
          ),
        };
      }),
    );
    const conceptsWithSigns = await Promise.all(
      concepts.map(async (concept) => {
        const trafficSignalConcepts = (
          await queryTrafficSignalConcepts(endpoint, {
            measureConceptUri: concept.uri,
            imageBaseUrl,
          })
        ).sort((a, b) => a.position - b.position);
        return {
          ...concept,
          trafficSignalConcepts,
        };
      }),
    );
    // @ts-expect-error don't know how to fix this error
    return conceptsWithSigns;
  }
}

export type MobilityMeasureQueryOptions = Omit<QueryOptions, 'count'>;
export async function queryMobilityMeasures(
  endpoint: string,
  options: MobilityMeasureQueryOptions = {},
) {
  return _queryMobilityMeasures(endpoint, { ...options, count: false });
}

export type MobilityMeasureCountOptions = Omit<
  QueryOptions,
  'count' | 'page' | 'pageSize'
>;
export function countMobilityMeasures(
  endpoint: string,
  options: MobilityMeasureCountOptions = {},
) {
  return _queryMobilityMeasures(endpoint, { ...options, count: true });
}
