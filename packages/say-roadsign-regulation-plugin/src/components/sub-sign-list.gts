import type { TOC } from '@ember/component/template-only';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import { fn } from '@ember/helper';
import AuCheckbox from '@appuniversum/ember-appuniversum/components/au-checkbox';
import isSelectedSign from '#root/helpers/is-selected-sign.ts';

type Sig = {
  Args: {
    subSigns: TrafficSignalConcept[];
    mainSign: TrafficSignalConcept;
    selectedSigns: TrafficSignalConcept[];
    selectSubSign: (
      subSign: TrafficSignalConcept,
      mainSign: TrafficSignalConcept,
    ) => void;
  };
};

const TrafficMeasureSubSignList: TOC<Sig> = <template>
  <div class="au-u-flex au-u-flex--column au-u-margin-left-large">
    {{#each @subSigns as |subSign|}}
      <div class="au-u-margin-top-small au-u-flex au-u-flex--vertical-center">
        <AuCheckbox
          @checked={{isSelectedSign @selectedSigns subSign}}
          @onChange={{fn @selectSubSign subSign @mainSign}}
        >
          <img
            src={{subSign.image}}
            alt=""
            class="traffic-measure-preview--sign-image au-u-margin-right-small"
          />
          {{subSign.code}}
        </AuCheckbox>
      </div>
    {{/each}}
  </div>
</template>;

export default TrafficMeasureSubSignList;
