import type { MainSignWithInstruction } from '#root/plugin/types.ts';

export default function generateMeasureTemplate(
  signs: MainSignWithInstruction[],
): string {
  const lines: string[] = [];
  const selections = [...signs].sort(
    (signA, signB) => signA.mainSign.position - signB.mainSign.position,
  );
  for (let i = 0; i < selections.length; i++) {
    const selection = selections[i];
    const line: string[] = [`\${${locatieLabel(i)}}`];
    if (selection.mainSign.selectedInstruction) {
      line.push(selection.mainSign.selectedInstruction.value);
    }
    for (const subSign of selection.subSigns) {
      if (subSign.selectedInstruction) {
        line.push(subSign.selectedInstruction.value);
      }
    }
    lines.push(line.join(' '));
  }
  return lines.join(';\n');
}

function locatieLabel(index: number) {
  return index === 0 ? 'locatie' : `locatie${index + 1}`;
}
