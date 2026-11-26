import type ArDesign from '@lblod/say-ar-design-plugin/plugin/models/ar-design';
import type Instruction from '@lblod/say-ar-design-plugin/plugin/models/instruction';
import type MeasureDesign from '@lblod/say-ar-design-plugin/plugin/models/measure-design';
import type RoadSignCategory from '@lblod/say-ar-design-plugin/plugin/models/road-sign-category';
import type TrafficSignal from '@lblod/say-ar-design-plugin/plugin/models/traffic-signal';
import type TrafficSignalConcept from '@lblod/say-ar-design-plugin/plugin/models/traffic-signal-concept';
import type VariableInstance from '@lblod/say-ar-design-plugin/plugin/models/variable-instance';

export const VKS_DESIGN_SERVICE_BASE_URL = 'http://localhost:8955';

type JsonApiIdentifier = { type: string; id: string };

type JsonApiAttributes = {
  uri?: string;
  name?: string;
  date?: string;
  label?: string;
  type?: string;
  code?: string;
  meaning?: string;
  image?: string;
  preview?: string;
  value?: string;
  'value-label'?: string;
  codelist?: string;
  source?: string;
  'regulatory-notation'?: string;
  'main-signs'?: string[];
  'design-status'?: string;
  'template-string'?: string;
  'raw-template-string'?: string;
};

type JsonApiResource = {
  id: string;
  type: string;
  attributes: JsonApiAttributes;
  relationships?: Record<
    string,
    { data?: JsonApiIdentifier | JsonApiIdentifier[] }
  >;
};

type JsonApiDocument = {
  data: JsonApiResource | JsonApiResource[];
  included?: JsonApiResource[];
};

export async function fetchJsonApiDocument(
  url: string,
): Promise<JsonApiDocument> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`request to ${url} failed with status ${response.status}`);
  }
  return (await response.json()) as JsonApiDocument;
}

export function documentData(document: JsonApiDocument): JsonApiResource[] {
  return Array.isArray(document.data) ? document.data : [document.data];
}

function jsonApiResourceIndex(document: JsonApiDocument) {
  const index = new Map<string, JsonApiResource>();
  for (const resource of document.included ?? []) {
    index.set(`${resource.type}/${resource.id}`, resource);
  }
  return index;
}

function relatedIdentifiers(
  resource: JsonApiResource,
  relationship: string,
): JsonApiIdentifier[] {
  const data = resource.relationships?.[relationship]?.data;
  if (!data) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}

function relatedResource(
  resource: JsonApiResource,
  relationship: string,
  index: Map<string, JsonApiResource>,
): JsonApiResource | undefined {
  const identifier = relatedIdentifiers(resource, relationship)[0];
  return identifier
    ? index.get(`${identifier.type}/${identifier.id}`)
    : undefined;
}

function mapRoadSignCategory(resource: JsonApiResource): RoadSignCategory {
  return {
    id: resource.id,
    uri: resource.attributes.uri ?? '',
    label: resource.attributes.label ?? '',
  };
}

function mapInstruction(resource: JsonApiResource): Instruction {
  return {
    id: resource.id,
    uri: resource.attributes.uri ?? '',
    value: resource.attributes.value ?? '',
    preview: resource.attributes.preview ?? '',
  };
}

function mapTrafficSignalConcept(
  resource: JsonApiResource,
  index: Map<string, JsonApiResource>,
): TrafficSignalConcept {
  const includedResource = (identifier: JsonApiIdentifier) =>
    index.get(`${identifier.type}/${identifier.id}`);
  return {
    id: resource.id,
    uri: resource.attributes.uri ?? '',
    code: resource.attributes.code ?? '',
    meaning: resource.attributes.meaning ?? '',
    regulatoryNotation: resource.attributes['regulatory-notation'],
    image: resource.attributes.image ?? '',
    type: resource.attributes.type ?? '',
    categories: relatedIdentifiers(resource, 'categories').flatMap(
      (identifier) => {
        const category = includedResource(identifier);
        return category ? [mapRoadSignCategory(category)] : [];
      },
    ),
    instructions: relatedIdentifiers(resource, 'instructions').flatMap(
      (identifier) => {
        const instruction = includedResource(identifier);
        return instruction ? [mapInstruction(instruction)] : [];
      },
    ),
    mainSigns: resource.attributes['main-signs'] ?? [],
  };
}

function mapTrafficSignal(
  resource: JsonApiResource,
  position: number,
  index: Map<string, JsonApiResource>,
): TrafficSignal {
  const concept = relatedResource(resource, 'traffic-signal-concept', index);
  if (!concept) {
    throw new Error(
      `traffic signal concept for traffic signal ${resource.id} is missing from the response`,
    );
  }
  return {
    id: resource.id,
    uri: resource.attributes.uri ?? '',
    designStatus: resource.attributes['design-status'],
    position,
    trafficSignalConcept: mapTrafficSignalConcept(concept, index),
  };
}

function mapMeasureConcept(
  resource: JsonApiResource,
): MeasureDesign['measureConcept'] {
  return {
    id: resource.id,
    uri: resource.attributes.uri ?? '',
    label: resource.attributes.label ?? '',
    templateString: resource.attributes['template-string'] ?? '',
    rawTemplateString: resource.attributes['raw-template-string'] ?? '',
  };
}

function mapVariableInstance(
  resource: JsonApiResource,
  index: Map<string, JsonApiResource>,
): VariableInstance {
  const variable = relatedResource(resource, 'variable', index);
  if (!variable) {
    throw new Error(
      `variable for variable instance ${resource.id} is missing from the response`,
    );
  }
  return {
    id: resource.id,
    uri: resource.attributes.uri ?? '',
    value: resource.attributes.value,
    valueLabel: resource.attributes['value-label'],
    variable: {
      id: variable.id,
      uri: variable.attributes.uri ?? '',
      type: (variable.attributes.type ??
        'text') as VariableInstance['variable']['type'],
      label: variable.attributes.label ?? '',
      source: variable.attributes.source ?? '',
      codelist: variable.attributes.codelist,
    },
  };
}

function mapMeasureDesign(
  resource: JsonApiResource,
  index: Map<string, JsonApiResource>,
): MeasureDesign {
  const measureConcept = relatedResource(resource, 'measure-concept', index);
  if (!measureConcept) {
    throw new Error(
      `measure concept for measure design ${resource.id} is missing from the response`,
    );
  }
  const signalConcepts = (relationship: string) =>
    relatedIdentifiers(resource, relationship).flatMap((identifier) => {
      const concept = index.get(`${identifier.type}/${identifier.id}`);
      return concept ? [mapTrafficSignalConcept(concept, index)] : [];
    });
  return {
    id: resource.id,
    uri: resource.attributes.uri ?? '',
    trafficSignals: relatedIdentifiers(resource, 'traffic-signals').map(
      (identifier, position) => {
        const signal = index.get(`${identifier.type}/${identifier.id}`);
        if (!signal) {
          throw new Error(
            `traffic signal ${identifier.id} is missing from the response`,
          );
        }
        return mapTrafficSignal(signal, position, index);
      },
    ),
    measureConcept: mapMeasureConcept(measureConcept),
    unusedSignalConcepts: signalConcepts('unused-signal-concepts'),
    unIncludedSignalConcepts: signalConcepts('un-included-signal-concepts'),
    variableInstances: relatedIdentifiers(
      resource,
      'variable-instances',
    ).flatMap((identifier) => {
      const instance = index.get(`${identifier.type}/${identifier.id}`);
      return instance ? [mapVariableInstance(instance, index)] : [];
    }),
  };
}

async function fetchMeasureDesigns(
  arDesignId: string,
): Promise<MeasureDesign[]> {
  const document = await fetchJsonApiDocument(
    `${VKS_DESIGN_SERVICE_BASE_URL}/ar-designs/${arDesignId}/measure-designs`,
  );
  const index = jsonApiResourceIndex(document);
  return documentData(document).map((resource) =>
    mapMeasureDesign(resource, index),
  );
}

export function mapArDesign(resource: JsonApiResource): ArDesign {
  let measureDesigns: Promise<MeasureDesign[]> | undefined;
  return {
    id: resource.id,
    uri: resource.attributes.uri ?? '',
    name: resource.attributes.name ?? '',
    date: new Date(resource.attributes.date ?? 0),
    get measureDesigns() {
      return (measureDesigns ??= fetchMeasureDesigns(resource.id));
    },
  };
}
