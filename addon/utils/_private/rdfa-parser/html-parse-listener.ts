/**
 * Modified from https://github.com/rubensworks/rdfa-streaming-parser.js
 *
 * Copyright © 2019 Ruben Taelman
 */

/**
 * An HTML parsing listener.
 */
export interface IHtmlParseListener {
  /**
   * Called when a tag is opened.
   * @param {string} name The tag name.
   * @param {{[p: string]: string}} attributes A hash of attributes.
   */
  onTagOpen(name: string, attributes: { [s: string]: string }): void;

  /**
   * Called when a tag is closed.
   */
  onTagClose(): void;

  /**
   * Called when text contents are parsed.
   * Note that this can be called multiple times per tag,
   * when for example the string is spread over multiple chunks.
   * @param {string} data A string.
   */
  onText(data: string): void;

  /**
   * Called when parsing has ended.
   */
  onEnd(): void;
}
