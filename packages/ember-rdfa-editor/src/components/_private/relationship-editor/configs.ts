import type {
  ObjectOption,
  OptionGeneratorConfig,
  PredicateOption,
} from './types.ts';
import { sayDataFactory } from '#root/core/say-data-factory/data-factory.ts';
import type SayController from '#root/core/say-controller.ts';
import { getSubjects } from '#root/plugins/rdfa-info/utils.ts';
import { rdfaInfoPluginKey } from '#root/plugins/rdfa-info/plugin.ts';
import { isRdfaAttrs } from '#root/core/rdfa-types.ts';
import SetUtils from '#root/utils/_private/set-utils.ts';

export const documentConfig: (
  controller: SayController,
) => OptionGeneratorConfig = (controller) => ({
  subjects: ({ searchString = '' } = {}) => {
    const resources = getSubjects(controller.mainEditorState);
    return resources
      .map((resource) => ({
        term: sayDataFactory.resourceNode(resource),
      }))
      .filter(({ term }) =>
        term.value.toLowerCase().includes(searchString.toLowerCase()),
      );
  },
  predicates: ({ searchString = '', direction } = {}) => {
    const rdfaIdMapping = rdfaInfoPluginKey.getState(
      controller.mainEditorState,
    )?.rdfaIdMapping;
    if (!rdfaIdMapping) {
      return [];
    }
    const predicates: Set<string> = new Set();
    rdfaIdMapping.forEach((resolvedNode) => {
      const node = resolvedNode.value;
      if (isRdfaAttrs(node.attrs) && node.attrs.rdfaNodeType === 'resource') {
        SetUtils.addMany(
          predicates,
          ...node.attrs.properties
            .map((prop) => prop.predicate)
            .filter((predicate) => predicate.includes(searchString)),
        );
      }
    });

    const predicateList = [...predicates];
    let propertyPredicates: PredicateOption[] = [];
    let backlinkPredicates: PredicateOption[] = [];
    if (!direction || direction === 'property') {
      propertyPredicates = predicateList.map((predicate) => ({
        direction: 'property',
        term: sayDataFactory.namedNode(predicate),
      }));
    }
    if (!direction || direction === 'backlink') {
      backlinkPredicates = predicateList.map((predicate) => ({
        direction: 'backlink',
        term: sayDataFactory.namedNode(predicate),
      }));
    }
    return [...propertyPredicates, ...backlinkPredicates];
  },
  objects: ({ searchString = '' } = {}) => {
    const resources = getSubjects(controller.mainEditorState);
    const rdfaIdMapping = rdfaInfoPluginKey.getState(
      controller.mainEditorState,
    )?.rdfaIdMapping;
    const literals: string[] = [];
    if (rdfaIdMapping) {
      rdfaIdMapping.forEach((resolvedNode, rdfaId) => {
        if (resolvedNode.value.attrs['rdfaNodeType'] === 'literal') {
          literals.push(rdfaId);
        }
      });
    }
    const resourceOptions: ObjectOption[] = resources.map((resource) => ({
      term: sayDataFactory.resourceNode(resource),
    }));
    const literalOptions: ObjectOption[] = literals.map((rdfaId) => ({
      term: sayDataFactory.literalNode(rdfaId),
    }));
    return [...resourceOptions, ...literalOptions].filter(({ term }) =>
      term.value.toLowerCase().includes(searchString.toLowerCase()),
    );
  },
});

const fetchLovApi: (args: {
  type: 'property' | 'class';
  pageSize: number;
  searchString: string;
}) => Promise<Record<string, unknown>[]> = async ({
  type,
  pageSize,
  searchString,
}) => {
  const abortController = new AbortController();
  try {
    const url = `https://lov.linkeddata.es/dataset/lov/api/v2/term/autocomplete?q=${searchString}&type=${type}&page_size=${pageSize}`;
    const response = await fetch(url, { signal: abortController.signal });
    const result = (await response.json()) as Record<string, unknown>;
    const results = result['results'] as Record<string, unknown>[];
    return results;
  } finally {
    abortController.abort();
  }
};

export const lovConfig: (args?: {
  pageSize?: number;
}) => OptionGeneratorConfig = ({ pageSize = 10 } = {}) => ({
  subjects: () => {
    return [];
  },
  predicates: async ({ searchString = '', direction } = {}) => {
    if (!searchString) {
      return [];
    }

    const results = await fetchLovApi({
      type: 'property',
      pageSize,
      searchString,
    });
    const predicateOptionTerms: PredicateOption[] = results.flatMap(
      (result) => {
        return [
          {
            direction: 'property',
            term: sayDataFactory.namedNode(result['uri'] as string),
          },
          {
            direction: 'backlink',
            term: sayDataFactory.namedNode(result['uri'] as string),
          },
        ];
      },
    );
    return predicateOptionTerms.filter(
      (option) => !direction || option.direction === direction,
    );
  },
  objects: async ({ searchString = '' } = {}) => {
    if (!searchString) {
      return [];
    }

    const results = await fetchLovApi({
      type: 'class',
      pageSize,
      searchString,
    });
    const objectOptionTerms: ObjectOption[] = results.flatMap((result) => {
      return [
        {
          term: sayDataFactory.namedNode(result['uri'] as string),
        },
      ];
    });
    return objectOptionTerms;
  },
});

export const combineConfigs = (
  ...configs: OptionGeneratorConfig[]
): OptionGeneratorConfig => ({
  subjects: async (args) => {
    const results = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/await-thenable
      configs.map((config) => config.subjects?.(args) ?? []),
    );
    return results.flat();
  },
  predicates: async (args) => {
    const results = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/await-thenable
      configs.map((config) => config.predicates?.(args) ?? []),
    );
    return results.flat();
  },
  objects: async (args) => {
    const results = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/await-thenable
      configs.map((config) => config.objects?.(args) ?? []),
    );
    return results.flat();
  },
});
