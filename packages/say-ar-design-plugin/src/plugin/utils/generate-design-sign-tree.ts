import type MeasureDesign from '#root/plugin/models/measure-design.ts';
import type TrafficSignal from '#root/plugin/models/traffic-signal.ts';
import type TrafficSignalConcept from '#root/plugin/models/traffic-signal-concept.ts';
import {
  TRAFFIC_SIGNAL_CONCEPT_TYPES,
  ROAD_SIGN_CATEGORIES,
} from '#root/plugin/constants.ts';
import type ArDesign from '#root/plugin/models/ar-design.ts';

import {
  SignWithInstruction,
  type MainSignWithInstruction,
} from '#root/plugin/types.ts';

export function isSubSign(signal: TrafficSignalConcept): boolean {
  if (signal.type !== TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN) return false;
  const classifications = signal.categories;
  return classifications.some(
    (category) => category.uri === ROAD_SIGN_CATEGORIES.ONDERBORD,
  );
}

function generateMeasureSignTree(measure: MeasureDesign) {
  const trafficSignConcepts = measure.trafficSignals;
  if (!trafficSignConcepts.length) return { signs: [] };
  const signsMap: Map<string, MainSignWithInstruction> = new Map();
  const subSigns: TrafficSignal[] = [];
  for (const signal of trafficSignConcepts) {
    const signalConcept = signal.trafficSignalConcept;
    if (!signalConcept.uri) continue;
    if (isSubSign(signalConcept)) {
      subSigns.push(signal);
    } else {
      signsMap.set(signalConcept.uri, {
        mainSign: new SignWithInstruction(signalConcept, signal.position),
        subSigns: [],
      });
    }
  }
  for (const subSign of subSigns) {
    const subSignConcept = subSign.trafficSignalConcept;
    if (subSignConcept.type !== TRAFFIC_SIGNAL_CONCEPT_TYPES.ROAD_SIGN)
      continue;
    const mainSigns = subSignConcept.mainSigns;
    for (const mainSign of mainSigns) {
      const previewItem = signsMap.get(mainSign);
      if (previewItem) {
        previewItem.subSigns.push(
          new SignWithInstruction(subSignConcept, subSign.position),
        );
      }
    }
  }
  return { signs: [...signsMap.values()] };
}

export default async function generateDesignSignTree(design: ArDesign) {
  const measureDesigns = await design.measureDesigns;
  return measureDesigns.map(generateMeasureSignTree);
}
