import {
  type BindingObject,
  executeQuery,
  objectify,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor/utils/sparql-helpers';
import type { Instruction } from '../schemas/instruction.ts';
import type { RoadSignCategory } from '../schemas/road-sign-category.ts';
import { TrafficSignalConceptSchema } from '../schemas/traffic-signal-concept.ts';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '../constants.ts';

type QueryOptions = {
  imageBaseUrl?: string;
  measureConceptUri: string;
  abortSignal?: AbortSignal;
};

type TrafficSignalConceptBinding = {
  uri: string;
  type: string;
  code: string;
  regulatoryNotation?: string;
  image?: string;
  position?: string;
  category?: string;
  categoryLabel?: string;
  instruction?: string;
  instructionValue?: string;
  instructionPreview?: string;
  mainSign?: string;
};

type GroupedTrafficSignalConcept = {
  uri: string;
  type: string;
  code: string;
  regulatoryNotation?: string;
  image: string;
  position?: string;
  categories: Map<string, RoadSignCategory>;
  instructions: Map<string, Instruction>;
  mainSigns: Set<string>;
};

function trafficSignalConceptPattern(measureConceptUri: string) {
  return /* sparql */ `
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
  `;
}

function imagePattern(imageBaseUrl?: string) {
  return /* sparql */ `
    OPTIONAL {
      ?uri mobiliteit:grafischeWeergave/ext:hasFile/mu:uuid ?imageId.
      BIND(CONCAT(${sparqlEscapeString(imageBaseUrl ?? '')}, "/files/", ?imageId, "/download") AS ?image)
    }
  `;
}

const regulatoryNotationPattern = /* sparql */ `
  OPTIONAL {
    ?uri ext:regulatoryNotation ?regulatoryNotation.
  }
`;

const roadSignCategoryPattern = /* sparql */ `
  OPTIONAL {
    ?uri dct:type ?category.
    ?category
      a mobiliteit:Verkeersbordcategorie;
      skos:prefLabel ?categoryLabel.
  }
`;

const instructionPattern = /* sparql */ `
  OPTIONAL {
    ?uri mobiliteit:heeftInstructie ?instruction.
    ?instruction
      a mobiliteit:Template;
      rdf:value ?instructionValue;
      ext:preview ?instructionPreview.
  }
`;

const mainSignPattern = /* sparql */ `
  OPTIONAL {
    ?mainSign mobiliteit:heeftMogelijkOnderbord ?uri.
  }
`;

const typeValuesPattern = /* sparql */ `
  VALUES ?type {
    ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN)}
    ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING)}
    ${sparqlEscapeUri(TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT)}
  }
`;

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
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    SELECT DISTINCT
      ?uri
      ?type
      ?code
      ?regulatoryNotation
      ?image
      ?position
      ?category
      ?categoryLabel
      ?instruction
      ?instructionValue
      ?instructionPreview
      ?mainSign
    WHERE {
      ${trafficSignalConceptPattern(measureConceptUri)}

      ${imagePattern(imageBaseUrl)}

      ${regulatoryNotationPattern}

      ${roadSignCategoryPattern}

      ${instructionPattern}

      ${mainSignPattern}

      ${typeValuesPattern}
    }
  `;
  const queryResult = await executeQuery<
    BindingObject<TrafficSignalConceptBinding>
  >({
    query,
    endpoint,
    abortSignal,
  });
  const groupedConcepts = groupBindingsByConcept(queryResult.results.bindings);
  return TrafficSignalConceptSchema.array().parse(
    [...groupedConcepts.values()].map((groupedConcept) => {
      const { categories, instructions, mainSigns, ...concept } =
        groupedConcept;
      if (concept.type !== TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) {
        return concept;
      }
      return {
        ...concept,
        categories: [...categories.values()],
        instructions: [...instructions.values()],
        mainSigns: [...mainSigns],
      };
    }),
  );
}

function groupBindingsByConcept(
  bindings: BindingObject<TrafficSignalConceptBinding>[],
) {
  const concepts = new Map<string, GroupedTrafficSignalConcept>();
  for (const binding of bindings) {
    const objectified = objectify(binding);
    let concept = concepts.get(objectified.uri);
    if (!concept) {
      concept = {
        uri: objectified.uri,
        type: objectified.type,
        code: objectified.code,
        regulatoryNotation: objectified.regulatoryNotation,
        image: objectified.image ?? '',
        position: objectified.position,
        categories: new Map<string, RoadSignCategory>(),
        instructions: new Map<string, Instruction>(),
        mainSigns: new Set<string>(),
      };
      concepts.set(objectified.uri, concept);
    }
    if (objectified.category && objectified.categoryLabel) {
      concept.categories.set(objectified.category, {
        uri: objectified.category,
        label: objectified.categoryLabel,
      });
    }
    if (
      objectified.instruction &&
      objectified.instructionValue &&
      objectified.instructionPreview
    ) {
      concept.instructions.set(objectified.instruction, {
        uri: objectified.instruction,
        value: objectified.instructionValue,
        preview: objectified.instructionPreview,
      });
    }
    if (objectified.mainSign) {
      concept.mainSigns.add(objectified.mainSign);
    }
  }
  return concepts;
}
