import type { TOC } from '@ember/component/template-only';
import type TrafficSignalConcept from '#root/plugin/models/traffic-signal-concept.ts';

type Sig = {
  Args: {
    subSigns: TrafficSignalConcept[];
  };
};

const TrafficMeasureSubSignList: TOC<Sig> = <template>
  <div
    class="au-u-flex au-u-flex--column traffic-measure-preview--subsign-container"
  >
    {{#each @subSigns as |subSign|}}
      <div class="au-u-margin-top-small au-u-flex au-u-flex--vertical-center">
        <img
          src={{subSign.image}}
          alt=""
          class="traffic-measure-preview--sign-image au-u-margin-right-small"
        />
        {{subSign.code}}
      </div>
    {{/each}}
  </div>
</template>;

export default TrafficMeasureSubSignList;
