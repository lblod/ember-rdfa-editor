import {
  EditorState,
  Fragment,
  PNode,
  Schema,
  Selection,
} from '@lblod/ember-rdfa-editor';
import { v4 as uuid } from 'uuid';
import { addPropertyToNode } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { type FullTriple } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  DCT,
  EXT,
  MOBILITEIT,
  ONDERDEEL,
  PROV,
  RDF,
} from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/constants';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  transactionCombinator,
  type TransactionMonad,
} from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import { type MobilityMeasureConcept } from '../schemas/mobility-measure-concept.ts';
import { buildArticleStructure } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/build-article-structure';
import {
  insertArticle,
  type InsertArticleFreelyArgs,
  type InsertArticleToDecisionArgs,
} from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/insert-article';
import { type TrafficSignalConcept } from '../schemas/traffic-signal-concept.ts';
import {
  ROAD_SIGN_CATEGORIES,
  TRAFFIC_SIGNAL_CONCEPT_TYPES,
  TRAFFIC_SIGNAL_TYPE_MAPPING,
  TRAFFIC_SIGNAL_TYPES,
  ZONALITY_OPTIONS,
  type ZonalOrNot,
} from '../constants.ts';
import {
  isTrafficSignal,
  type TrafficSignal,
} from '../schemas/traffic-signal.ts';
import { type MobilityMeasureDesign } from '../schemas/mobility-measure-design.ts';
import { type VariableInstance } from '../schemas/variable-instance.ts';
import removeZFromLabel from '#root/helpers/removeZFromLabel.ts';
import { namespace } from '@lblod/ember-rdfa-editor/utils/namespace';
import { constructMeasureFragment } from '../construct-measure-fragment.ts';

// This is defined locally as it's an implementation quirk that we don't want to use generally
const RELATIE_OBJECT = namespace(
  'https://wegenenverkeer.data.vlaanderen.be/ns/implementatieelement#RelatieObject.',
  'relatieobject',
);

export type InsertPositionArgs =
  | {
      insertFreely: true;
      decisionUri?: string;
    }
  | {
      insertFreely?: false;
      position?: number;
      decisionUri: string;
    };
type InsertMeasureArgs = {
  arDesignUri?: string;
  zonality: ZonalOrNot;
  temporal: boolean;
  variables: Record<string, VariableInstance & { __rdfaId: string }>;
  templateString: string;
  articleUriGenerator?: () => string;
} & InsertPositionArgs &
  (
    | {
        measureConcept: MobilityMeasureConcept;
      }
    | {
        measureDesign: MobilityMeasureDesign;
      }
  );

export default function insertMeasure({
  arDesignUri,
  zonality,
  temporal,
  variables,
  templateString,
  articleUriGenerator,
  ...args
}: InsertMeasureArgs): TransactionMonad<boolean> {
  return function (state: EditorState) {
    const measureConcept =
      'measureConcept' in args
        ? args.measureConcept
        : args.measureDesign.measureConcept;
    const measureDesign = 'measureDesign' in args && args.measureDesign;
    let externalTriples: FullTriple[] | undefined;
    if (arDesignUri && measureDesign) {
      // We don't get this URI from VKS as we're generally not interested in the internal
      // implementation details of their system. Since this association class made it's way into the
      // model, we now need it. Their URIs are of the form https://does.not.resolve/BevatMaatregelOntwerp/<UID>
      // which implies that they do not intend them to be outward facing. We therefore create our
      // own URI here for internal use, and to avoid needing blank nodes, which can cause issues
      // with some tooling.
      const associationClassUri = `https://does.not.resolve/lblod/BevatMaatregelOntwerp/${uuid()}`;
      externalTriples = [
        {
          subject: sayDataFactory.namedNode(associationClassUri),
          predicate: RELATIE_OBJECT('bron').full,
          object: sayDataFactory.namedNode(arDesignUri),
        },
        {
          subject: sayDataFactory.namedNode(associationClassUri),
          predicate: RDF('type').full,
          object: ONDERDEEL('BevatMaatregelOntwerp').namedNode,
        },
        {
          subject: sayDataFactory.namedNode(associationClassUri),
          predicate: RELATIE_OBJECT('doel').full,
          object: sayDataFactory.namedNode(measureDesign.uri),
        },
        {
          subject: sayDataFactory.namedNode(measureDesign.uri),
          predicate: RDF('type').full,
          object: MOBILITEIT('MobiliteitsmaatregelOntwerp').namedNode,
        },
        {
          subject: sayDataFactory.namedNode(arDesignUri),
          predicate: RDF('type').full,
          object: MOBILITEIT('AanvullendReglementOntwerp').namedNode,
        },
      ];
    }
    const { schema } = state;
    const signNodes = measureConcept.trafficSignalConcepts
      .filter(
        (signConcept) =>
          signConcept.type !== TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN ||
          !signConcept.categories.some(
            (cat) => cat.uri === ROAD_SIGN_CATEGORIES.ZONEBORD,
          ),
      )
      .map((signConcept) => constructSignalNode(signConcept, schema, zonality));
    let signSection: PNode[] = [];
    if (signNodes.length) {
      const signList = schema.nodes['bullet_list'].create(
        {},
        signNodes.map((signNode) =>
          schema.nodes['list_item'].create(
            {},
            schema.nodes['paragraph'].create({}, signNode),
          ),
        ),
      );
      signSection = [
        schema.nodes['paragraph'].create(
          {},
          schema.text('Dit wordt aangeduid door verkeerstekens:'),
        ),
        signList,
      ];
    }
    const measureUri = `http://data.lblod.info/mobiliteitsmaatregels/${uuid()}`;
    const measureBody = constructMeasureFragment(
      templateString,
      variables,
      schema,
      [
        {
          subject: sayDataFactory.resourceNode(measureUri),
          predicate: MOBILITEIT('plaatsbepaling').full,
        },
      ],
    );
    const temporalNode = temporal
      ? schema.nodes['paragraph'].create(
          {},
          schema.text('Deze signalisatie is dynamisch.'),
        )
      : undefined;
    const measureNode = schema.nodes['block_rdfa'].create(
      {
        rdfaNodeType: 'resource',
        subject: measureUri,
        __rdfaId: uuid(),
        label: `Mobiliteitsmaatregel ${removeZFromLabel(measureConcept.label)}`,
        properties: [
          {
            predicate: RDF('type').full,
            object: sayDataFactory.namedNode(
              MOBILITEIT('Mobiliteitsmaatregel').full,
            ),
          },
          {
            predicate: PROV('wasDerivedFrom').full,
            object: sayDataFactory.namedNode(measureConcept.uri),
          },
          {
            // TODO this should be replaced by MOBILITEIT('zone'), but we need to know what to
            // actually link this to as we have no way to specify zones
            predicate: EXT('zonality').full,
            object: sayDataFactory.namedNode(zonality),
          },
          {
            predicate: DCT('description').full,
            object: sayDataFactory.contentLiteral('nl-BE'),
          },
          ...(measureDesign
            ? [
                {
                  predicate: MOBILITEIT('isGebaseerdOpMaatregelOntwerp'),
                  object: sayDataFactory.namedNode(measureDesign.uri),
                },
              ]
            : []),
          // TODO there are some properties that are missing from the measure that we should define if we can:
          // locn:address, mobiliteit:contactorganisatie, mobiliteit:doelgroep, adms:identifier,
          // mobiliteit:periode, mobiliteit:plaatsbepaling, schema:eventSchedule, mobiliteit:type,
          // mobiliteit:verwijstNaar, mobiliteit:heeftGevolg
          ...Object.values(variables)
            .filter(
              (variableInstance) =>
                variableInstance.variable.type === 'location',
            )
            .map((variableInstance) => ({
              predicate: MOBILITEIT('plaatsbepaling').full,
              object: sayDataFactory.literalNode(variableInstance.__rdfaId),
            })),
        ],
        externalTriples,
      },
      [...measureBody, ...signSection, ...(temporalNode ? [temporalNode] : [])],
    );
    const articleNode = buildArticleStructure(
      state.schema,
      articleUriGenerator,
    ).copy(Fragment.from(measureNode));
    const insertArticleArgs = args.insertFreely
      ? ({
          node: articleNode,
          decisionUri: args.decisionUri,
          insertFreely: args.insertFreely,
        } satisfies InsertArticleFreelyArgs)
      : ({
          node: articleNode,
          decisionUri: args.decisionUri,
          insertFreely: false,
          position: args.position,
        } satisfies InsertArticleToDecisionArgs);
    const initialTransaction =
      insertArticle(insertArticleArgs)(state).transaction;
    const resultingSelection = initialTransaction.selection;
    const { transaction, result } = transactionCombinator(
      state,
      initialTransaction,
    )([
      addPropertyToNode({
        resource: articleNode.attrs['subject'] as string,
        property: {
          predicate: MOBILITEIT('heeftMobiliteitsmaatregel').full,
          object: sayDataFactory.resourceNode(
            measureNode.attrs['subject'] as string,
          ),
        },
      }),
      ...signNodes.map((signNode) =>
        addPropertyToNode({
          resource: measureNode.attrs['subject'] as string,
          property: {
            predicate: MOBILITEIT('wordtAangeduidDoor').full,
            object: sayDataFactory.resourceNode(
              signNode.attrs['subject'] as string,
            ),
          },
        }),
      ),
    ]);
    transaction.setSelection(
      Selection.fromJSON(transaction.doc, resultingSelection.toJSON()),
    );
    return {
      initialState: state,
      transaction,
      result: result.every(Boolean),
    };
  };
}

function determineSignLabel(signConcept: TrafficSignalConcept) {
  switch (signConcept.type) {
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT:
      return 'Verkeerslicht';
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING:
      return 'Wegmarkering';
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN:
      if (
        signConcept.categories
          .map((cat) => cat.uri)
          .includes(ROAD_SIGN_CATEGORIES.ONDERBORD)
      ) {
        return 'Onderbord';
      } else {
        return 'Verkeersbord';
      }
  }
}

function constructSignalNode(
  signalOrSignalConcept: TrafficSignal | TrafficSignalConcept,
  schema: Schema,
  zonality?: ZonalOrNot,
) {
  const signalConcept = isTrafficSignal(signalOrSignalConcept)
    ? signalOrSignalConcept.trafficSignalConcept
    : signalOrSignalConcept;
  const signalUri = isTrafficSignal(signalOrSignalConcept)
    ? signalOrSignalConcept.uri
    : `http://data.lblod.info/verkeerstekens/${uuid()}`;
  const prefix = determineSignLabel(signalConcept);
  const zonalityText =
    !zonality || zonality !== ZONALITY_OPTIONS.ZONAL
      ? ''
      : prefix === 'Onderbord'
        ? ' op het verkeersbord met zonale geldigheid'
        : ' met zonale geldigheid';
  const node = schema.nodes['inline_rdfa'].create(
    {
      rdfaNodeType: 'resource',
      subject: signalUri,
      __rdfaId: uuid(),
      properties: [
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(TRAFFIC_SIGNAL_TYPES.TRAFFIC_SIGNAL),
        },
        {
          predicate: RDF('type').full,
          object: sayDataFactory.namedNode(
            TRAFFIC_SIGNAL_TYPE_MAPPING[signalConcept.type],
          ),
        },
        {
          predicate: PROV('wasDerivedFrom').full,
          object: sayDataFactory.namedNode(signalOrSignalConcept.uri),
        },
        // TODO should include extra Verkeersteken properties? mobiliteit:heeftOnderbord,
        // mobiliteit:isBeginZone, mobiliteit:isEindeZone?
      ],
    },
    schema.text(
      `${prefix} ${signalConcept.regulatoryNotation || signalConcept.code}${zonalityText}`,
    ),
  );
  return node;
}
