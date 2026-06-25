import Service from '@ember/service';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import type { EditorState, SayController } from '@lblod/ember-rdfa-editor';
import {
  transactionCombinator,
  type TransactionCombinatorResult,
  type TransactionMonad,
} from '@lblod/ember-rdfa-editor/utils/transaction-utils';
import {
  type Notification,
  notificationPluginKey,
} from '@lblod/ember-rdfa-editor/plugins/notification';
import insertMeasure from '@lblod/say-roadsign-regulation-plugin/plugin/actions/insert-measure';
import { ZONALITY_OPTIONS } from '@lblod/say-roadsign-regulation-plugin/plugin/constants';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/decision-utils';
import { VariableInstanceSchema } from '@lblod/say-roadsign-regulation-plugin/plugin/schemas/variable-instance';
import { TrafficSignalConceptSchema } from '@lblod/say-roadsign-regulation-plugin/plugin/schemas/traffic-signal-concept';
import type ArDesign from '../plugin/models/ar-design.ts';
import type TrafficSignal from '../plugin/models/traffic-signal.ts';
import type VariableInstance from '../plugin/models/variable-instance.ts';
import { v4 as uuidv4 } from 'uuid';
import { TRAFFIC_SIGNAL_EXISTING_STATUSES } from '../plugin/constants.ts';
import {
  ArticleInsertPosition,
  afterLastArticle,
} from '../plugin/utils/article-insert-position.ts';

export type ImportResult<R> = {
  result: R;
  warnings: string[];
};
export type GenerateImportResult = ImportResult<TransactionMonad<boolean>[]>;

function convertVariableInstances(variableInstances: VariableInstance[]) {
  return Object.fromEntries(
    variableInstances.map((varInstance) => {
      const variableInstance = VariableInstanceSchema.parse({
        uri: varInstance.uri,
        value: varInstance.value,
        valueLabel: varInstance.valueLabel,
        variable: {
          source: varInstance.variable.source,
          uri: varInstance.variable.uri,
          type: varInstance.variable.type,
          label: varInstance.variable.label,
          codelistUri: varInstance.variable.codelist,
        },
      });
      const variableInstanceWithRdfaId = {
        ...variableInstance,
        __rdfaId: uuidv4(),
      };
      return [varInstance.variable.label, variableInstanceWithRdfaId];
    }),
  );
}

function convertSignals(signals: TrafficSignal[]) {
  const concepts = signals.map((s) => s.trafficSignalConcept);
  const conceptssWithoutZSign = concepts.filter(
    (concept) => concept.code !== 'Z',
  );
  const dedupedConcepts: typeof concepts = [];
  for (const concept of conceptssWithoutZSign) {
    if (!dedupedConcepts.find((c) => c.code === concept.code)) {
      dedupedConcepts.push(concept);
    }
  }

  const conceptsWithCategories = dedupedConcepts.map((trafficSignalConcept) => {
    return {
      code: trafficSignalConcept.code,
      uri: trafficSignalConcept.uri,
      type: trafficSignalConcept.type,
      image: '',
      categories: trafficSignalConcept.categories,
      regulatoryNotation: trafficSignalConcept.regulatoryNotation,
    };
  });

  return TrafficSignalConceptSchema.array().parse(conceptsWithCategories);
}

export default class ArImporterService extends Service {
  @service declare intl: IntlService;

  _notifyError(controller: SayController, translationKey: string) {
    // Show a notification via the notification plugin
    const { notificationCallback, intl } = notificationPluginKey.getState(
      controller.mainEditorState,
    ) as {
      notificationCallback: (notification: Notification) => void;
      intl: IntlService;
    };
    notificationCallback({
      title: intl.t(translationKey),
      options: {
        type: 'error',
        icon: AlertTriangleIcon,
      },
    });
  }

  async generateInsertionMonads(
    decisionUriOrController: string | SayController,
    design: ArDesign,
    insertPos: ArticleInsertPosition,
    isPreview?: boolean,
  ): Promise<GenerateImportResult> {
    let decisionUri: string;
    if (typeof decisionUriOrController === 'string') {
      decisionUri = decisionUriOrController;
    } else {
      const decisionRange = getCurrentBesluitRange(decisionUriOrController);
      decisionUri = decisionRange?.node.attrs['subject'] as string;
      if (!decisionRange || typeof decisionUri !== 'string') {
        this._notifyError(
          decisionUriOrController,
          'ar-importer.message.error-no-decision',
        );
        return { result: [], warnings: [] };
      }
    }
    try {
      const warnings: string[] = [];
      const measureDesigns = await design.measureDesigns;
      const monads = measureDesigns.flatMap((measureDesign) => {
        const {
          measureConcept,
          trafficSignals,
          variableInstances,
          unusedSignalConcepts,
          unIncludedSignalConcepts,
        } = measureDesign;
        warnings.push(
          ...unusedSignalConcepts.map((unused) =>
            this.intl.t('ar-importer.message.warning-unused-signal-concept', {
              measure: measureConcept.label,
              signal: unused.code,
            }),
          ),
        );
        warnings.push(
          ...unIncludedSignalConcepts.map((unIncluded) =>
            this.intl.t(
              'ar-importer.message.warning-un-included-signal-concept',
              {
                measure: measureConcept.label,
                signal: unIncluded.code,
              },
            ),
          ),
        );
        const filteredAndDeduplicatedConcepts = convertSignals(trafficSignals);
        const convertedVariableInstances =
          convertVariableInstances(variableInstances);
        const isZonal = Boolean(
          trafficSignals.find((s) => s.trafficSignalConcept.code === 'Z'),
        );
        const zonality = isZonal
          ? ZONALITY_OPTIONS.ZONAL
          : ZONALITY_OPTIONS.NON_ZONAL;
        const onlyExistingSignals = measureDesign.trafficSignals.every(
          (signal) =>
            signal.designStatus &&
            TRAFFIC_SIGNAL_EXISTING_STATUSES.includes(signal.designStatus),
        );
        return [
          ...(isPreview && onlyExistingSignals
            ? [
                (state: EditorState) => {
                  const commentText = state.schema.text(
                    this.intl.t('ar-importer.preview.only-existing'),
                  );
                  const cn =
                    state.schema.nodes['templateComment']?.create(
                      {},
                      commentText,
                    ) ?? commentText;
                  return {
                    initialState: state,
                    transaction: state.tr.insert(state.selection.to + 1, cn),
                    result: true,
                  };
                },
              ]
            : []),
          insertMeasure({
            arDesignUri: design.uri,
            measureDesign: {
              uri: measureDesign.uri,
              measureConcept: {
                uri: measureConcept.uri,
                label: `${measureConcept.label}${onlyExistingSignals ? ` (${this.intl.t('ar-importer.preview.only-existing-label')})` : ''}`,
                preview: measureConcept.templateString,
                zonality,
                variableSignage: false,
                trafficSignalConcepts: filteredAndDeduplicatedConcepts,
              },
              trafficSignals: filteredAndDeduplicatedConcepts,
            },
            zonality,
            temporal: false,
            variables: convertedVariableInstances,
            templateString: measureConcept.templateString,
            decisionUri,
            position: insertPos.insertMeasureIndex,
            articleUriGenerator: () =>
              `http://data.lblod.info/artikels/${uuidv4()}`,
          }),
        ];
      });

      return {
        result: monads,
        warnings,
      };
    } catch (err) {
      console.error('Error processing AR design relations', err);
      throw err;
    }
  }

  async generatePreview(
    design: ArDesign,
    processDocumentHeadlessly: (
      html: string,
      transactionGenerator: (
        state: EditorState,
      ) => TransactionCombinatorResult<boolean>,
    ) => string,
  ): Promise<ImportResult<string>> {
    const decisionUri = 'http://data.lblod.info/id/besluiten/12345';
    const { result: monads, warnings } = await this.generateInsertionMonads(
      decisionUri,
      design,
      afterLastArticle,
      true,
    );
    const document = processDocumentHeadlessly(
      `<div property="prov:generated" resource="${decisionUri}" typeof="besluit:Besluit ext:BesluitNieuweStijl"><div property="prov:value" datatype="xsd:string"></div></div>`,
      (state) => transactionCombinator<boolean>(state)(monads),
    );
    return { result: document, warnings };
  }

  insertAr(
    controller: SayController,
    monads: TransactionMonad<boolean>[],
  ): boolean {
    try {
      controller.withTransaction((tr) => {
        return transactionCombinator<boolean>(
          controller.mainEditorState,
          tr,
        )(monads).transaction;
      });
      return true;
    } catch (_err) {
      this._notifyError(
        controller,
        'ar-importer.message.error-processing-design',
      );
      return false;
    }
  }
}
