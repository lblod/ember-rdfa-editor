export default function removeZFromLabel(label: string) {
  let labelResult = label.replace('-Z-', '-');
  labelResult = labelResult.replace('-Z', '');
  return labelResult;
}
