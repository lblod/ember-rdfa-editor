export const ALIGNMENT_OPTIONS = [
  'left',
  'right',
  'center',
  'justify',
] as const;

export const DEFAULT_ALIGNMENT = 'left';

export type AlignmentOption = (typeof ALIGNMENT_OPTIONS)[number];

const isValidAlignment = (alignment: string): alignment is AlignmentOption =>
  ALIGNMENT_OPTIONS.includes(alignment as AlignmentOption);

export function getAlignment(node: HTMLElement): AlignmentOption | undefined {
  const alignStyle = node.style.textAlign;

  if (isValidAlignment(alignStyle)) {
    return alignStyle;
  }

  // Attempt to fall back to the align attribute. It is a deprecated attribute,
  // but might still be returned in some cases by some word processors.
  const alignAttribute = node.getAttribute('align');

  if (alignAttribute && isValidAlignment(alignAttribute)) {
    return alignAttribute;
  }

  return;
}
