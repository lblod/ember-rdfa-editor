export function getListLevel(element: Element): number {
  const styleAttribute = element.getAttribute('style') || '';
  const matches = /level(\d+)/im.exec(styleAttribute);

  if (matches && matches.length >= 1) {
    const [, level] = matches;
    return parseInt(level, 10);
  }

  return 1;
}
