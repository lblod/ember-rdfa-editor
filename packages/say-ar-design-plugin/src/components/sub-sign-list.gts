import type { TOC } from '@ember/component/template-only';
import type { SignWithInstruction } from '#root/plugin/types.ts';

type Sig = {
  Args: {
    subSigns: SignWithInstruction[];
  };
};

const TrafficMeasureSubSignList: TOC<Sig> = <template>
  <div
    class="au-u-flex au-u-flex--column traffic-measure-preview--subsign-container"
  >
    {{#each @subSigns as |subSign|}}
      <div class="au-u-margin-top-small au-u-flex au-u-flex--vertical-center">
        <img
          src={{subSign.sign.image}}
          alt=""
          class="traffic-measure-preview--sign-image au-u-margin-right-small"
        />
        {{subSign.sign.code}}
      </div>
    {{/each}}
  </div>
</template>;

export default TrafficMeasureSubSignList;
