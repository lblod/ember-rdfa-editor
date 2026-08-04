import { type TOC } from '@ember/component/template-only';
import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
type Args = {
    concept: MobilityMeasureConcept;
    limitText?: boolean;
};
declare const MeasurePreview: TOC<Args>;
export default MeasurePreview;
