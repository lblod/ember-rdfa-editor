import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import MeasurePreview from './measure-preview.gts';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { ZONALITY_OPTIONS, type ZonalOrNot } from '#root/plugin/constants.ts';
import { type Task } from 'ember-concurrency';
import { isSome } from '@lblod/ember-rdfa-editor/utils/option';
import set from '@lblod/ember-rdfa-editor/helpers/set';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { PNode } from '@lblod/ember-rdfa-editor';
import PowerSelect from 'ember-power-select/components/power-select';

export type InsertMobilityMeasureTask = Task<
  void,
  [MobilityMeasureConcept, ZonalOrNot, boolean, number?]
>;
type Signature = {
  Args: {
    concept: MobilityMeasureConcept;
    selectRow: (uri: string) => void;
    insert: InsertMobilityMeasureTask;
    endpoint: string;
    articleNodes: PNode[];
  };
};

type InsertPositionOption = {
  label: string;
  position: 'first' | 'last' | 'custom';
  insertIndex?: number;
};

export default class ExpandedMeasure extends Component<Signature> {
  @service declare intl: IntlService;

  @tracked zonalityValue?: ZonalOrNot;
  @tracked temporalValue?: boolean;
  @tracked selectedInsertPosition: InsertPositionOption;

  insertPositionOptionFirst: InsertPositionOption;
  insertPositionOptionLast: InsertPositionOption;

  constructor(owner: unknown, args: Signature['Args']) {
    super(owner, args);
    this.insertPositionOptionFirst = {
      label: this.intl.t(
        'editor-plugins.roadsign-regulation.expanded-measure.as-first-article',
      ),
      position: 'first',
      insertIndex: 0,
    };
    this.insertPositionOptionLast = {
      label: this.intl.t(
        'editor-plugins.roadsign-regulation.expanded-measure.as-last-article',
      ),
      position: 'last',
    };
    this.selectedInsertPosition = this.insertPositionOptionLast;
  }

  get isPotentiallyZonal() {
    return this.args.concept.zonality === ZONALITY_OPTIONS.POTENTIALLY_ZONAL;
  }

  get insertButtonDisabled() {
    return (
      (this.isPotentiallyZonal && !this.zonalityValue) ||
      this.args.insert.isRunning ||
      (this.args.concept.variableSignage && !isSome(this.temporalValue))
    );
  }

  @action
  changeZonality(zonality: ZonalOrNot) {
    this.zonalityValue = zonality;
  }

  @action
  changeTemporality(temporality: 'true' | 'false') {
    this.temporalValue = temporality === 'true';
  }

  @action
  insert() {
    const { insertIndex } = this.selectedInsertPosition;
    return this.args.insert.perform(
      this.args.concept,
      // POTENTIALLY_ZONAL option is filtered out by requiring a zonalityValue to submit
      (this.zonalityValue ?? this.args.concept.zonality) as ZonalOrNot,
      this.temporalValue ?? false,
      insertIndex,
    );
  }

  @action
  unselectRow() {
    this.args.selectRow(this.args.concept.uri);
  }

  get articlesInDocument() {
    return this.args.articleNodes;
  }

  get insertPositionOptions() {
    return [
      this.insertPositionOptionLast,
      this.insertPositionOptionFirst,
      ...this.articlesInDocument.slice(1).map((_, index) => ({
        label: this.intl.t(
          'editor-plugins.roadsign-regulation.expanded-measure.after-article-x',
          { articleNumber: index + 1 },
        ),
        position: 'custom',
        insertIndex: index + 1,
      })),
    ];
  }

  get insertPositionDropdownTitle() {
    return this.selectedInsertPosition?.label.toLowerCase();
  }

  <template>
    <tr class="au-c-data-table__detail">
      <td colspan="5" class="au-o-flow au-o-flow--small">
        <AuHeading @level="6" @skin="6">
          {{t
            "editor-plugins.roadsign-regulation.expanded-measure.insert-measure"
          }}
        </AuHeading>
        <p>
          <AuPill>
            <MeasurePreview @concept={{@concept}} />
          </AuPill>
        </p>
        {{#if this.isPotentiallyZonal}}
          <AuHeading @level="6" @skin="6">
            {{t
              "editor-plugins.roadsign-regulation.expanded-measure.select-zonality.label"
            }}
          </AuHeading>
          <div class="au-c-form">
            <AuRadioGroup
              @name="zonal"
              @selected={{this.zonalityValue}}
              @onChange={{this.changeZonality}}
              as |Group|
            >
              <Group.Radio @value={{ZONALITY_OPTIONS.ZONAL}}>
                {{t
                  "editor-plugins.roadsign-regulation.expanded-measure.select-zonality.zonal"
                }}
              </Group.Radio>
              <Group.Radio @value={{ZONALITY_OPTIONS.NON_ZONAL}}>
                {{t
                  "editor-plugins.roadsign-regulation.expanded-measure.select-zonality.non-zonal"
                }}
              </Group.Radio>
            </AuRadioGroup>
          </div>
        {{/if}}
        {{#if @concept.variableSignage}}
          <AuHeading @level="6" @skin="6">
            {{t
              "editor-plugins.roadsign-regulation.expanded-measure.varying-signalisation.label"
            }}
          </AuHeading>
          <div class="au-c-form">
            <AuRadioGroup
              @name="temporal"
              @selected={{this.temporalValue}}
              @onChange={{this.changeTemporality}}
              as |Group|
            >
              <Group.Radio @value="true">
                {{t
                  "editor-plugins.roadsign-regulation.expanded-measure.varying-signalisation.varying"
                }}
              </Group.Radio>
              <Group.Radio @value="false">
                {{t
                  "editor-plugins.roadsign-regulation.expanded-measure.varying-signalisation.non-varying"
                }}
              </Group.Radio>
            </AuRadioGroup>
          </div>
        {{/if}}
        <AuHeading @level="6" @skin="6">
          {{t
            "editor-plugins.roadsign-regulation.expanded-measure.insert-position"
          }}
        </AuHeading>
        <PowerSelect
          class="au-u-1-5"
          @allowClear={{false}}
          @onChange={{set this "selectedInsertPosition"}}
          @selected={{this.selectedInsertPosition}}
          @options={{this.insertPositionOptions}}
          as |option|
        >{{option.label}}</PowerSelect>
        <AuButton
          {{on "click" this.insert}}
          @skin="primary"
          @loading={{@insert.isRunning}}
          @loadingMessage={{t "common.loading"}}
          @disabled={{this.insertButtonDisabled}}
        >
          {{t "common.insert"}}
        </AuButton>
      </td>
    </tr>
  </template>
}
