import { type MobilityMeasureConcept } from '#root/plugin/schemas/mobility-measure-concept.ts';
import { type TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import { TRAFFIC_SIGNAL_CONCEPT_TYPES } from './constants.ts';


type SignPreviewItem = {
    mainSign: TrafficSignalConcept;
    subSigns: TrafficSignalConcept[];
  };

export function isSubSign(signal: TrafficSignalConcept): boleean {
    if(signal.type !== TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) return false
    const classifications = signal.categories;
    return classifications.some((category) => category.label === 'Onderbord');
}

export default function generateMeasureSignTree(measure: MobilityMeasureConcept) {
    const trafficSignConcepts = measure.trafficSignalConcepts;
    if (!trafficSignConcepts.length) return { signs: []};
    const signsMap: Map<string, SignPreviewItem> = new Map();
    const subSigns: TrafficSignalConcept[] = [];
    for (const sign of trafficSignConcepts) {
      if (!sign.uri) continue;
      if (isSubSign(sign)) {
        subSigns.push(sign);
      } else {
        signsMap.set(sign.uri, {
          mainSign: sign,
          subSigns: [],
        });
      }
    }
    for (const subSign of subSigns) {
      if(subSign.type !== TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) continue;
      const mainSigns = subSign.mainSigns;
      for (const mainSign of mainSigns) {
        const previewItem = signsMap.get(mainSign);
        if (previewItem) {
          previewItem.subSigns.push(subSign);
        }
      }
    }
    console.log([...signsMap.values()])
    return { signs: [...signsMap.values()] };
}
