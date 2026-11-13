import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { type RoadsignRegulationPluginOptions } from '#root/plugin/types.ts';
import t from 'ember-intl/helpers/t';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import generateMeasureSignTree from '#root/plugin/generate-measure-sign-tree.ts';
import SignAccordion from '#root/components/sign-accordion.gts';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import { type Instruction } from '#root/plugin/schemas/instruction.ts';
import type IntlService from 'ember-intl/services/intl';
import { service } from '@ember/service';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import PowerSelect from 'ember-power-select/components/power-select';
import { ZONALITY_OPTIONS, type ZonalOrNot } from '#root/plugin/constants.ts';
import set from '@lblod/ember-rdfa-editor/helpers/set';
import { getArticleNodes } from '@lblod/ember-rdfa-editor/utils/_private/lblod-utils/document-structure-utils';

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

export default class RoadsignsInsertScreen extends Component<Signature> {
  @service declare intl: IntlService;
  @tracked selectedSigns: TrafficSignalConcept[] = [];
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
  }
  <template>
    <div class="au-o-grid au-u-height-full au-u-margin-none">
      <ChooseTrafficSignsStep
        @measureToInsert={{@measureToInsert}}
        @selectedSigns={{this.selectedSigns}}
        @selectSubSign={{this.selectSubSign}}
        @selectMainSign={{this.selectMainSign}}
      />
      <SuplementMeasureStep @selectedSigns={{this.selectedSigns}} />
      <AddMeasureStep
        @measureToInsert={{@measureToInsert}}
        @controller={{@controller}}
      />
    </div>
  </template>
}

type ChooseTrafficSignsStepSig = {
  Args: {
    measureToInsert?: MobilityMeasureConcept;
    selectedSigns: TrafficSignalConcept[];
    selectMainSign: (sign: TrafficSignalConcept) => void;
    selectSubSign: (
      subSign: TrafficSignalConcept,
      mainSign: TrafficSignalConcept,
    ) => void;
  };
};

class ChooseTrafficSignsStep extends Component<ChooseTrafficSignsStepSig> {
  get measureSignTree() {
    if (!this.args.measureToInsert) return { signs: [] };
    return generateMeasureSignTree(this.args.measureToInsert);
  }
  <template>
    <div class="au-o-grid__item au-u-1-3@medium au-u-padding">
      <AuHeading @skin="3" @level="2" class="au-u-margin-bottom">
        {{t
          "editor-plugins.roadsign-regulation.insert.choose-traffic-signs-title"
        }}
      </AuHeading>
      {{#each this.measureSignTree.signs as |sign|}}
        <SignAccordion
          @sign={{sign}}
          @selectedSigns={{@selectedSigns}}
          @selectMainSign={{@selectMainSign}}
          @selectSubSign={{@selectSubSign}}
        />
      {{/each}}

    </div>
  </template>
}

type SupplementMeasureStepSig = {
  Args: {
    selectedSigns: TrafficSignalConcept[];
  };
};

class SuplementMeasureStep extends Component<SupplementMeasureStepSig> {
  @tracked selectedInstruction?: string;
  @action
  selectInstruction(instruction: Instruction) {
    //TODO: in logic PR this should do something
    this.selectedInstruction = instruction.uri;
  }
  <template>
    <div
      class="au-o-grid__item au-u-1-3@medium traffic-measure-preview--insert-step-container au-u-padding"
    >
      <AuHeading @skin="3" @level="2" class="au-u-margin-bottom">
        {{t
          "editor-plugins.roadsign-regulation.insert.supplement-measure-title"
        }}
      </AuHeading>
      {{#each @selectedSigns as |sign|}}
        <div class="au-u-margin-bottom">
          <AuHeading @skin="6" @level="3">
            {{t "editor-plugins.roadsign-regulation.insert.instruction"}}
            {{sign.code}}
          </AuHeading>
          <PowerSelect
            @onChange={{this.selectInstruction}}
            @selected={{this.selectedInstruction}}
            @options={{sign.instructions}}
            @placeholder={{t
              "editor-plugins.roadsign-regulation.insert.instruction-placeholder"
            }}
            as |option|
          >{{option.preview}}</PowerSelect>
        </div>
      {{else}}
        <p class="au-u-muted au-u-italic">{{t
            "editor-plugins.roadsign-regulation.insert.no-instructions"
          }}</p>
      {{/each}}
    </div>
  </template>
}

type AddMeasureStepSig = {
  Args: {
    measureToInsert?: MobilityMeasureConcept;
    controller: SayController;
  };
};

class AddMeasureStep extends Component<AddMeasureStepSig> {
  @service declare intl: IntlService;
  @tracked zonalityValue?: ZonalOrNot;
  @tracked temporalValue?: boolean;

  insertPositionOptionFirst: InsertPositionOption;
  insertPositionOptionLast: InsertPositionOption;

  @tracked selectedInsertPosition: InsertPositionOption;

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

  @action
  changeZonality(zonality: ZonalOrNot) {
    this.zonalityValue = zonality;
  }

  @action
  changeTemporality(temporality: 'true' | 'false') {
    this.temporalValue = temporality === 'true';
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

  <template>
    <div
      class="au-o-grid__item au-u-1-3@medium traffic-measure-preview--insert-step-container au-u-padding"
    >
      <AuHeading @skin="3" @level="2" class="au-u-margin-bottom">
        {{t "editor-plugins.roadsign-regulation.insert.add-measure-title"}}
      </AuHeading>
      <div class="au-u-margin-bottom">
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
      </div>
      <div class="au-u-margin-bottom">
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
      </div>
      <div class="au-u-margin-bottom">
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
      <div class="au-u-margin-top-huge">
        <AuHeading @level="6" @skin="6">
          {{t
            "editor-plugins.roadsign-regulation.expanded-measure.template-preview"
          }}
        </AuHeading>
        <div
          class="traffic-measure-preview--template-preview au-u-padding-small"
        >
          {{@measureToInsert.preview}}
        </div>
      </div>
    </div>
  </template>
}
