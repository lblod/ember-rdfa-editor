import { getPathFromRoot } from '#root/utils/_private/dom-helpers.ts';
import { KnowledgeBase } from './knowledge-base.ts';

export function triplesWithElementContentAsValue(
  element: HTMLElement,
): KnowledgeBase {
  const kb = KnowledgeBase.fromHtmlNode(
    element.getRootNode(),
    getPathFromRoot(element, false),
  );

  const id = element.dataset['sayId'];
  if (!id) {
    return KnowledgeBase.empty;
  }
  return kb.quadsPointingToId(id);
}
