export const HIDE_FOR_PUBLISH_ATTR = 'data-say-hide-for-publish';

export function stripHtmlForPublish(content: string) {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(content, 'text/html');

  const allToBeFiltered = parsed.querySelectorAll(
    `[${HIDE_FOR_PUBLISH_ATTR}=true]`,
  );
  allToBeFiltered.forEach((toFilter) => {
    toFilter?.remove();
  });

  return parsed.body.innerHTML;
}
