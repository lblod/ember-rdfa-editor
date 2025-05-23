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
