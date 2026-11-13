import Component from '@glimmer/component';
import { type TOC } from '@ember/component/template-only';
import t from 'ember-intl/helpers/t';
import { fn } from '@ember/helper';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import generateMeasureSignTree from '#root/plugin/generate-measure-sign-tree.ts';
import SignAccordion from '#root/components/sign-accordion.gts';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import { type Instruction } from '#root/plugin/schemas/instruction.ts';
import {
  SelectedSign,
  type SelectedSigns,
  type MainSignSelection,
} from '#root/plugin/selected-signs.ts';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import PowerSelect from 'ember-power-select/components/power-select';
import { ZONALITY_OPTIONS, type ZonalOrNot } from '#root/plugin/constants.ts';

type Signature = {
  Args: {
    measureToInsert?: MobilityMeasureConcept;
    selectedSigns: SelectedSigns;
    template: string;
    zonalityValue?: ZonalOrNot;
    changeZonality: (zonality: ZonalOrNot) => void;
    temporalValue?: boolean;
    changeTemporality: (temporality: 'true' | 'false') => void;
    selectedInsertPosition: InsertPositionOption;
    selectInsertPosition: (option: InsertPositionOption) => void;
    insertPositionOptions: InsertPositionOption[];
    selectMainSign: (sign: TrafficSignalConcept) => void;
    selectSubSign: (
      subSign: TrafficSignalConcept,
      mainSign: TrafficSignalConcept,
    ) => void;
    selectInstruction: (
      selectedSign: SelectedSign,
      instruction: Instruction,
    ) => void;
  };
};

export type InsertPositionOption = {
  label: string;
  position: 'first' | 'last' | 'custom';
  insertIndex?: number;
};

const RoadsignsInsertScreen: TOC<Signature> = <template>
  <div class="au-o-grid au-u-height-full au-u-margin-none">
    <ChooseTrafficSignsStep
      @measureToInsert={{@measureToInsert}}
      @selectedSigns={{@selectedSigns}}
      @selectSubSign={{@selectSubSign}}
      @selectMainSign={{@selectMainSign}}
    />
    <SupplementMeasureStep
      @selectedSigns={{@selectedSigns}}
      @selectInstruction={{@selectInstruction}}
    />
    <AddMeasureStep
      @measureToInsert={{@measureToInsert}}
      @template={{@template}}
      @zonalityValue={{@zonalityValue}}
      @changeZonality={{@changeZonality}}
      @temporalValue={{@temporalValue}}
      @changeTemporality={{@changeTemporality}}
      @selectedInsertPosition={{@selectedInsertPosition}}
      @selectInsertPosition={{@selectInsertPosition}}
      @insertPositionOptions={{@insertPositionOptions}}
    />
  </div>
</template>;

export default RoadsignsInsertScreen;

type ChooseTrafficSignsStepSig = {
  Args: {
    measureToInsert?: MobilityMeasureConcept;
    selectedSigns: SelectedSigns;
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
    selectedSigns: SelectedSigns;
    selectInstruction: (
      selectedSign: SelectedSign,
      instruction: Instruction,
    ) => void;
  };
};

class SupplementMeasureStep extends Component<SupplementMeasureStepSig> {
  get flattenedAndSortedSelectedSigns() {
    const signs: SelectedSign[] = [];
    const selectedSignsSorted: MainSignSelection[] = [
      ...this.args.selectedSigns.values(),
    ];
    selectedSignsSorted.sort((signA, signB) => {
      return signA.mainSign.sign.position - signB.mainSign.sign.position;
    });
    for (const sign of selectedSignsSorted) {
      signs.push(sign.mainSign);
      for (const subSign of sign.subSigns.values()) {
        signs.push(subSign);
      }
    }
    return signs;
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
      {{#each this.flattenedAndSortedSelectedSigns as |selectedSign|}}
        <div class="au-u-margin-bottom">
          <AuHeading @skin="6" @level="3">
            {{t "editor-plugins.roadsign-regulation.insert.instruction"}}
            {{selectedSign.sign.code}}
          </AuHeading>
          <PowerSelect
            @onChange={{fn @selectInstruction selectedSign}}
            @selected={{selectedSign.selectedInstruction}}
            @options={{selectedSign.sign.instructions}}
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
    template: string;
    zonalityValue?: ZonalOrNot;
    changeZonality: (zonality: ZonalOrNot) => void;
    temporalValue?: boolean;
    changeTemporality: (temporality: 'true' | 'false') => void;
    selectedInsertPosition: InsertPositionOption;
    selectInsertPosition: (option: InsertPositionOption) => void;
    insertPositionOptions: InsertPositionOption[];
  };
};

class AddMeasureStep extends Component<AddMeasureStepSig> {
  get isPotentiallyZonal() {
    return (
      this.args.measureToInsert?.zonality === ZONALITY_OPTIONS.POTENTIALLY_ZONAL
    );
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
              @selected={{@zonalityValue}}
              @onChange={{@changeZonality}}
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
              @selected={{@temporalValue}}
              @onChange={{@changeTemporality}}
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
          @onChange={{@selectInsertPosition}}
          @selected={{@selectedInsertPosition}}
          @options={{@insertPositionOptions}}
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
          {{@template}}
        </div>
      </div>
    </div>
  </template>
}
