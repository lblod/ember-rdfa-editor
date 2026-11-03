import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
import t from 'ember-intl/helpers/t';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import generateMeasureSignTree from '#root/plugin/generate-measure-sign-tree.ts';
import TrafficMeasureSubSignList from '#root/components/sub-sign-list.gts';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import type IntlService from 'ember-intl/services/intl';
import { service } from '@ember/service';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from '#root/plugin/constants.ts';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import PowerSelect from 'ember-power-select/components/power-select';
import { ZONALITY_OPTIONS, type ZonalOrNot } from '#root/plugin/constants.ts';
import set from '@lblod/ember-rdfa-editor/helpers/set';
import { getArticleNodes } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/document-structure-utils';
import { fn } from '@ember/helper';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import isSelectedSign from '#root/helpers/is-selected-sign.ts';

type Signature = {
  Args: {
    controller: SayController;
    options: RoadsignRegulationPluginOptions;
    measureToInsert?: MobilityMeasureConcept;
  };
};

type InsertPositionOption = {
  label: string;
  position: 'first' | 'last' | 'custom';
  insertIndex?: number;
};

function signalLabel(signal: TrafficSignalConcept, intl: IntlService) {
  switch (signal.type) {
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN:
      return intl.t('traffic-measure-concept.main-sign');
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_MARKING:
      return intl.t('traffic-measure-concept.road-marking');
    case TRAFFIC_SIGNAL_CONCEPT_TYPES.TRAFFIC_LIGHT:
      return intl.t('traffic-measure-concept.traffic-light');
  }
}

export default class RoadsignsInsertScreen extends Component<Signature> {
  @service declare intl: IntlService;
  @tracked selectedSigns: TrafficSignalConcept[] = [];
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
    return (
      this.args.measureToInsert?.zonality === ZONALITY_OPTIONS.POTENTIALLY_ZONAL
    );
  }

  // get insertButtonDisabled() {
  //   return (
  //     (this.isPotentiallyZonal && !this.zonalityValue) ||
  //     this.args.insert.isRunning ||
  //     (this.args.concept.variableSignage && !isSome(this.temporalValue))
  //   );
  // }

  @action
  selectSubSign(subSign: TrafficSignalConcept, mainSign: TrafficSignalConcept) {
    let mainSignIndex = -1;
    let subSignIndex = -1;
    for (let i = 0; i < this.selectedSigns.length; i++) {
      const sign = this.selectedSigns[i];
      if (sign.uri === subSign.uri) {
        subSignIndex = i;
      } else if (sign.uri === mainSign.uri) {
        mainSignIndex = i;
      }
      if (mainSignIndex !== -1 && subSignIndex !== -1) {
        break;
      }
    }
    if (subSignIndex === -1) {
      if (mainSignIndex === -1) {
        this.selectedSigns = [...this.selectedSigns, mainSign, subSign];
      } else {
        this.selectedSigns = [...this.selectedSigns, subSign];
      }
    } else {
      // TODO refactor this
      const newSelectedSigns = this.selectedSigns.slice();
      newSelectedSigns.splice(subSignIndex, 1);
      this.selectedSigns = newSelectedSigns;
    }
  }

  @action
  selectMainSign(mainSign: TrafficSignalConcept) {
    const mainSignSelected = Boolean(
      this.selectedSigns.find(
        (selectedSign) => selectedSign.uri === mainSign.uri,
      ),
    );
    if (mainSignSelected) {
      //TODO: do the logic
      this.selectedSigns = this.selectedSigns.filter(
        (selectedSign) => selectedSign.uri !== mainSign.uri,
      );
    } else {
      this.selectedSigns = [...this.selectedSigns, mainSign];
    }
    console.log(this.selectedSigns);
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
    //const { insertIndex } = this.selectedInsertPosition;
    // return this.args.insert.perform(
    //   this.args.measureToInsert,
    //   // POTENTIALLY_ZONAL option is filtered out by requiring a zonalityValue to submit
    //   (this.zonalityValue ?? this.args.concept.zonality) as ZonalOrNot,
    //   this.temporalValue ?? false,
    //   insertIndex,
    // );
  }

  get articlesInDocument() {
    return getArticleNodes(this.args.controller.mainEditorState).map(
      (node) => node.node,
    );
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

  get measureSignTree() {
    if (!this.args.measureToInsert) return { signs: [] };
    return generateMeasureSignTree(this.args.measureToInsert);
  }
  <template>
    <div class="au-o-grid au-u-height-full">
      <div class="au-o-grid__item au-u-1-3@medium au-u-height-full">
        <div class="au-u-padding">
          <AuHeading @skin="3" @level="2">
            {{t
              "editor-plugins.roadsign-regulation.insert.choose-traffic-signs-title"
            }}
          </AuHeading>
        </div>
        {{#each this.measureSignTree.signs as |sign|}}
          <div
            class="traffic-measure-preview--main-sign-container au-u-margin-small au-u-padding-small"
          >
            <AuCheckbox
              @checked={{isSelectedSign this.selectedSigns sign.mainSign}}
              @onChange={{fn this.selectMainSign sign.mainSign}}
            >
              <AuHeading
                @level="6"
                @skin="6"
                class="au-u-flex au-u-flex--vertical-center"
              >
                <img
                  src={{sign.mainSign.image}}
                  alt=""
                  class="traffic-measure-preview--sign-image au-u-margin-right-small"
                />
                {{signalLabel sign.mainSign this.intl}}
                {{sign.mainSign.code}}
              </AuHeading>
            </AuCheckbox>
            {{#if sign.subSigns.length}}
              <TrafficMeasureSubSignList
                @subSigns={{sign.subSigns}}
                @mainSign={{sign.mainSign}}
                @selectedSigns={{this.selectedSigns}}
                @selectSubSign={{this.selectSubSign}}
              />
            {{/if}}
          </div>
        {{/each}}
      </div>
      <div
        class="au-o-grid__item au-u-1-3@medium au-u-height-full u-border-solid u-border-l u-border-divider au-u-padding"
      >
        <div class="au-u-padding">
          <AuHeading @skin="3" @level="2">
            {{t
              "editor-plugins.roadsign-regulation.insert.supplement-measure-title"
            }}
          </AuHeading>
          <div>
            {{#each this.selectedSigns as |sign|}}

              <AuHeading @skin="6" @level="3">
                {{t "editor-plugins.roadsign-regulation.insert.instruction"}}
                {{sign.code}}
              </AuHeading>
              <PowerSelect
                @onChange={{set this "selectedInsertPosition"}}
                @selected={{this.selectedInsertPosition}}
                @options={{sign.instructions}}
                as |option|
              >{{option.preview}}</PowerSelect>
            {{/each}}
          </div>
        </div>
      </div>
      <div
        class="au-o-grid__item au-u-1-3@medium au-u-height-full u-border-solid u-border-l u-border-divider au-u-padding"
      >
        <div class="au-u-padding">
          <AuHeading @skin="3" @level="2">
            {{t "editor-plugins.roadsign-regulation.insert.add-measure-title"}}
          </AuHeading>
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
          {{#if @measureToInsert.variableSignage}}
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
            @allowClear={{false}}
            @onChange={{set this "selectedInsertPosition"}}
            @selected={{this.selectedInsertPosition}}
            @options={{this.insertPositionOptions}}
            as |option|
          >{{option.label}}</PowerSelect>
        </div>
      </div>
    </div>
  </template>
}
