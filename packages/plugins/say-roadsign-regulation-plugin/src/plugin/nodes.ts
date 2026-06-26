import {
  getRdfaAttrs,
  type NodeSpec,
  rdfaAttrSpec,
  PNode,
} from '@lblod/ember-rdfa-editor';
import {
  DCT,
  EXT,
  MOBILITEIT,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/constants';
import {
  getOutgoingTriple,
  hasOutgoingNamedNodeTriple,
  hasRDFaAttribute,
} from '@lblod/ember-rdfa-editor/utils/namespace';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node';
import {
  SayDataFactory,
  sayDataFactory,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  isResourceAttrs,
  type ModelMigration,
  type ModelMigrationGenerator,
} from '@lblod/ember-rdfa-editor/core/rdfa-types';
import { getRdfaContentElement } from '@lblod/ember-rdfa-editor/core/schema';
import type { OutgoingTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  getNewZonalityUri,
  isLegacyZonalityUri,
  TRAFFIC_SIGNAL_TYPES,
} from './constants.ts';

const CONTENT_SELECTOR = `div[property~='${
  DCT('description').full
}'],div[property~='${DCT('description').prefixed}']`;

export const roadsign_regulation: NodeSpec = {
  content: 'block+',
  group: 'block',
  attrs: {
    ...rdfaAttrSpec({ rdfaAware: false }),
    resourceUri: {},
    measureUri: {},
    zonality: {},
  },
  classNames: ['say-roadsign-regulation'],
  toDOM(node: PNode) {
    const { resourceUri, measureUri, zonality } = node.attrs;
    return [
      'div',
      {
        property: MOBILITEIT('heeftVerkeersmaatregel'),
        typeof: MOBILITEIT('Mobiliteitsmaatregel'),
        resource: resourceUri as string,
        class: getClassnamesFromNode(node),
      },
      [
        'span',
        {
          style: 'display:none;',
          property: PROV('wasDerivedFrom'),
          resource: measureUri as string,
        },
      ],
      [
        'span',
        {
          style: 'display:none;',
          // TODO this should be replaced by MOBILITEIT('zone'), but we need to know what to
          // actually link this to as we have no way to specify zones
          property: EXT('zonality'),
          resource: zonality as string,
        },
      ],
      [
        'div',
        {
          property: DCT('description'),
          datatype: RDF('langString'),
          lang: 'nl-BE',
        },
        0,
      ],
    ];
  },
  parseDOM: [
    {
      tag: 'div',
      node: 'block_rdfa',
      getAttrs(node: HTMLElement) {
        const attrs = getRdfaAttrs(node, { rdfaAware: true });
        if (!attrs || attrs.rdfaNodeType !== 'resource') {
          return false;
        }
        if (
          hasRDFaAttribute(
            node,
            'typeof',
            MOBILITEIT('Mobiliteitsmaatregel'),
          ) &&
          node.querySelector(CONTENT_SELECTOR)
        ) {
          const resourceUri = node.getAttribute('resource');
          const measureConceptUri = node
            .querySelector(
              `span[property~='${PROV('wasDerivedFrom').prefixed}'],
             span[property~='${PROV('wasDerivedFrom').full}']`,
            )
            ?.getAttribute('resource');
          const zonality = node
            .querySelector(
              `span[property~='${EXT('zonality').prefixed}'],
           span[property~='${EXT('zonality').full}']`,
            )
            ?.getAttribute('resource');
          if (!resourceUri || !measureConceptUri || !zonality) {
            return false;
          }
          const { rdfaNodeType, properties, backlinks, __rdfaId } = attrs;
          // We need to ensure that a content-literal for the description is added
          let propertiesFiltered = properties.filter(
            (prop) => !DCT('description').matches(prop.predicate),
          );
          propertiesFiltered.push({
            predicate: DCT('description').full,
            object: sayDataFactory.contentLiteral(),
          });

          // Previously having no 'temporal' value could lead to a relationship being added, but
          // to `resource="false". Strip this.
          const temporal = node
            .querySelector(
              `span[property~='${EXT('temporal').prefixed}'],
           span[property~='${EXT('temporal').full}']`,
            )
            ?.getAttribute('resource');
          if (temporal === 'false') {
            propertiesFiltered = propertiesFiltered.filter(
              (prop) => !EXT('temporal').matches(prop.predicate),
            );
          }

          return {
            rdfaNodeType,
            __rdfaId,
            properties: propertiesFiltered,
            backlinks,
            subject: resourceUri,
            label: `Mobiliteitsmaatregel`,
          };
        }
        return false;
      },
      contentElement: CONTENT_SELECTOR,
    },
  ],
};

const trafficSignalRDFTypeReplacements = [
  [MOBILITEIT('Verkeersbord-Verkeersteken'), TRAFFIC_SIGNAL_TYPES.ROAD_SIGN],
  [
    MOBILITEIT('Verkeerslicht-Verkeersteken'),
    TRAFFIC_SIGNAL_TYPES.TRAFFIC_LIGHT,
  ],
  [MOBILITEIT('Wegmarkering-Verkeersteken'), TRAFFIC_SIGNAL_TYPES.ROAD_MARKING],
] as const;
/**
 * Migrates documents from a data model featuring multiple nested inline_rdfa nodes to one that uses
 * namedNodes to encode everything in one inline_rdfa
 **/
export const trafficSignalMigration: ModelMigrationGenerator = (attrs) => {
  const factory = new SayDataFactory();
  for (const [source, replacement] of trafficSignalRDFTypeReplacements) {
    const conceptTriple = getOutgoingTriple(
      attrs,
      MOBILITEIT('heeftVerkeersbordconcept'),
    );
    if (
      isResourceAttrs(attrs) &&
      hasOutgoingNamedNodeTriple(attrs, RDF('type'), source) &&
      conceptTriple
    ) {
      return {
        getAttrs: () => {
          const conceptProp = {
            predicate: PROV('wasDerivedFrom').full,
            object: factory.namedNode(conceptTriple.object.value),
          };
          return {
            ...attrs,
            properties: [
              ...(conceptProp ? [conceptProp] : []),
              {
                predicate: RDF('type').full,
                object: sayDataFactory.namedNode(
                  TRAFFIC_SIGNAL_TYPES.TRAFFIC_SIGNAL,
                ),
              },
              {
                predicate: RDF('type').full,
                object: sayDataFactory.namedNode(replacement),
              },
            ],
          };
        },
        contentElement: (element) => {
          const content = element.querySelector(
            '[property="http://www.w3.org/2004/02/skos/core#prefLabel"]',
          );
          return getRdfaContentElement(content || element);
        },
      } satisfies ModelMigration;
    }
  }
  return false;
};

export const trafficMeasureModelMigration: ModelMigrationGenerator = (
  attrs,
) => {
  const factory = new SayDataFactory();

  if (
    !isResourceAttrs(attrs) ||
    !hasOutgoingNamedNodeTriple(
      attrs,
      RDF('type'),
      MOBILITEIT('Mobiliteitsmaatregel'),
    )
  ) {
    return false;
  }

  // Migrate zonality to new model
  let newProps: OutgoingTriple[] | undefined;
  const zonalityTriple = getOutgoingTriple(attrs, EXT('zonality'));
  if (zonalityTriple && isLegacyZonalityUri(zonalityTriple.object.value)) {
    const newZonalityProp = {
      predicate: EXT('zonality').full,
      object: factory.namedNode(getNewZonalityUri(zonalityTriple.object.value)),
    };
    newProps = attrs.properties
      .filter((prop) => !EXT('zonality').matches(prop.predicate))
      .concat([newZonalityProp]);
  }

  // Remove invalid temporal values
  const temporalTriple = getOutgoingTriple(attrs, EXT('temporal'));
  if (
    temporalTriple &&
    temporalTriple.object.value === 'http://example.org/false'
  ) {
    newProps = (newProps ?? attrs.properties).filter(
      (prop) => !EXT('temporal').matches(prop.predicate),
    );
  }

  if (!newProps) {
    return false;
  }
  return {
    getAttrs: () => {
      return {
        ...attrs,
        properties: newProps,
      };
    },
  } satisfies ModelMigration;
};
/**
 * @deprecated moved to trafficMeasureModelMigration
 */
export const trafficMeasureZonalityMigration = trafficMeasureModelMigration;
