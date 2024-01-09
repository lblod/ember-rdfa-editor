import { EditorView } from 'prosemirror-view';

/**
 * An extra hack width to make sure the editor doesn't overflow.
 */
const ADDITIONAL_WIDTH_MARGIN = 5;

/**
 * Returns the width of the editor view minus the padding
 */
export function getEditorViewWidth(view: EditorView): number {
  const computedStyle = window.getComputedStyle(view.dom);

  const paddingLeft = computedStyle.paddingLeft
    ? parseInt(computedStyle.paddingLeft, 10)
    : 0;
  const paddingRight = computedStyle.paddingRight
    ? parseInt(computedStyle.paddingRight, 10)
    : 0;

  const clientWidthWithoutPadding =
    view.dom.clientWidth - paddingLeft - paddingRight;

  if (!clientWidthWithoutPadding) {
    return 0;
  }

  return clientWidthWithoutPadding - ADDITIONAL_WIDTH_MARGIN;
}
