import type { TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.ts';
import type { MainSignSelection } from '#root/plugin/selected-signs.ts';

export default function isSelectedSign(
  selectedSigns: Map<string, MainSignSelection>,
  sign: TrafficSignalConcept,
  mainSign?: TrafficSignalConcept,
) {
  if (mainSign) {
    return Boolean(selectedSigns.get(mainSign.uri)?.subSigns.has(sign.uri));
  }
  return selectedSigns.has(sign.uri);
}
