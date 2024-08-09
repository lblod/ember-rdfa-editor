import { find as linkifyFind, test as linkifyTest } from 'linkifyjs';
import { isNone, type Option } from './option';

/**
 * If passed a link *and just a link* (ignoring leading and trailing whitespace), return the href
 * for that link, including mailto: for email addresses (using linkify.js).
 */
export function linkToHref(text: string) {
  if (!linkifyTest(text.trim())) {
    // Either isn't a link or contains additional text
    return '';
  }
  return linkifyFind(text)?.[0]?.href;
}

export function jsonParse<T = unknown>(json: Option<string>): T | undefined {
  if (isNone(json)) {
    return undefined;
  }
  try {
    return JSON.parse(json);
  } catch (err) {
    console.warn('unable to parse JSON', json, err);
    return undefined;
  }
}
