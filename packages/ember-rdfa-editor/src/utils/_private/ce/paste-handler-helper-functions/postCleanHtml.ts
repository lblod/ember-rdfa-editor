export function postCleanHtml(html: string): string {
  const ZERO_WIDTH_SPACE = '\u200B';
  const cleanHtml = html.trim().replace(new RegExp(ZERO_WIDTH_SPACE, 'g'), '');

  return `<body>${cleanHtml}</body>`;
}
