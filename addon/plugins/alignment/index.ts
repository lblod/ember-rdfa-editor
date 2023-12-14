export const ALIGNMENT_OPTIONS = [
  'left',
  'right',
  'center',
  'justify',
] as const;

export const DEFAULT_ALIGNMENT = 'left';

export type AlignmentOption = (typeof ALIGNMENT_OPTIONS)[number];

export function getAlignment(node: HTMLElement): AlignmentOption | undefined {
  const textAlign = node.style.textAlign;
  if ((ALIGNMENT_OPTIONS as ReadonlyArray<string>).includes(textAlign)) {
    return textAlign as AlignmentOption;
  } else {
    return;
  }
}
