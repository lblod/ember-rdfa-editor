import { NON_BREAKING_SPACE } from '@lblod/ember-rdfa-editor/utils/_private/constants.ts';
import { tagName } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers.ts';
import { PHRASING_CONTENT } from '@lblod/ember-rdfa-editor/utils/_private/constants.ts';

/**
 * utility function to convert text content styled using `white-space: pre-wrap`
 * so that it will display the same using `white-space: normal`.
 * This means we have to convert consecutive white-space and segment breaks
 * so that they will not collapse.
 * More information on https://drafts.csswg.org/css-text/#white-space-property
 * and https://drafts.csswg.org/css-text/#line-break-transform
 */
export function preWrapToNormalWhiteSpace(from: string): string {
  // step 1: replace spaces that would collapse with non breaking ones
  let output = from.replace(/[\v\t ]{2}/g, `${NON_BREAKING_SPACE} `);

  // step 2: replaces spaces that would not render
  output = output.replace(/[\v\t ]$/g, `${NON_BREAKING_SPACE}`);
  return output;
}

/**
 * utility function to convert text content styled using `white-space: normal`
 * so that it will display the same using `white-space: pre-wrap`.
 * This means:
 *   - we have to trim consecutive whitespace, because it's not visible
 *   - remove linebreaks because they are not visible
 *   - (optional?) replace non breaking spaces with regular spaces
 *   - (optional?) replaces newlines/returns with the <br> element
 * More information on https://drafts.csswg.org/css-text/#white-space-property
 * and https://drafts.csswg.org/css-text/#line-break-transform
 */
export function normalToPreWrapWhiteSpace(from: Text): string {
  let trimmed = from.textContent ? from.textContent : '';
  // step 1 replace linebreaks with spaces
  const linebreakPattern = /[\n\r]/g;
  trimmed = trimmed.replace(linebreakPattern, ' ');

  // step 2 collapse whitespace (no need to replace newline and return characters here, this was done in step 1)
  // Use ECMA-262 Edition 3 String and RegExp features
  const pattern = /[\f\t\v ]{2,}/g;
  const replacement = ' ';
  trimmed = trimmed.replace(pattern, replacement);

  // step 3, remove starting spaces because they don't show
  const stripFirstSpace = !shouldRenderFirstSpace(from);
  if (stripFirstSpace && trimmed.charAt(0) == ' ') {
    trimmed = trimmed.substring(1, trimmed.length);
  }

  if (!trimmed.length || trimmed.trim().length == 0) {
    return '';
  }

  return trimmed;
}

function shouldRenderFirstSpace(from: Text | Element): boolean {
  if (from.previousSibling) {
    const sibling = from.previousSibling;
    if (sibling.nodeType === Node.TEXT_NODE) {
      if (sibling.textContent?.endsWith(' ')) {
        return false;
      } else {
        return true;
      }
    } else if (sibling.nodeType === Node.ELEMENT_NODE) {
      if (PHRASING_CONTENT.includes(tagName(sibling))) {
        if (sibling.textContent?.endsWith(' ')) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else if (from.parentElement) {
    if (PHRASING_CONTENT.includes(tagName(from.parentElement))) {
      return shouldRenderFirstSpace(from.parentElement);
    } else {
      // first child of block element
      return false;
    }
  } else {
    return false;
  }
}
