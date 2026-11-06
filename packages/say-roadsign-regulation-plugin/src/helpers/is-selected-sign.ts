import type { TrafficSignalConcept } from '#root/plugin/schemas/traffic-signal-concept.js';

export default function isSelectedSign(
  selectedSigns: TrafficSignalConcept[],
  sign: TrafficSignalConcept,
) {
  return Boolean(
    selectedSigns.find((selectedSign) => selectedSign.uri === sign.uri),
  );
}
