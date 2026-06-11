import limitText from '@lblod/ember-rdfa-editor/helpers/limit-text';
import { type TOC } from '@ember/component/template-only';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';

type Args = {
  concept: MobilityMeasureConcept;
  limitText?: boolean;
};

const MeasurePreview: TOC<Args> = <template>
  {{#if @limitText}}
    {{limitText @concept.preview}}
  {{else}}
    {{@concept.preview}}
  {{/if}}
</template>;

export default MeasurePreview;
