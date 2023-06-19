import DOMPurify from 'dompurify';

export const DEFAULT_SAFE_ATTRIBUTES = [
  'colspan',
  'rowspan',
  'title',
  'alt',
  'class',
  'cellspacing',
  'axis',
  'about',
  'property',
  'datatype',
  'typeof',
  'resource',
  'rel',
  'rev',
  'content',
  'vocab',
  'prefix',
  'href',
  'src',
  'style',
];

export const DEFAULT_SAFE_TAGS = [
  'a',
  'b',
  'br',
  'body',
  'code',
  'data',
  'datalist',
  'div',
  'dl',
  'dt',
  'dd',
  'i',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'li',
  'link',
  'meta',
  'nav',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'th',
  'thead',
  'time',
  'tr',
  'ul',
  'var',
  'wbr',
  'u',
];
export const DEFAULT_URI_SAFE_ATTRIBUTES = [
  'about',
  'property',
  'datatype',
  'typeof',
  'resource',
  'vocab',
  'prefix',
];

// limited set of tags we allow for pasting
export const LIMITED_SAFE_TAGS = [
  'a',
  'p',
  'br',
  'ol',
  'ul',
  'li',
  'strong',
  'u',
  'em',
  's',
  'b',
  'table',
  'thead',
  'tbody',
  'th',
  'tr',
  'td',
  'div',
  'span',
];

interface HTMLInputParserArguments {
  safeAttributes?: string[];
  lumpTags?: string[];
  safeTags?: string[];
  uriSafeAttributes?: string[];
  tagMap?: Map<string, string>;
}

/**
 * An html input parser for the editor.
 * The parser makes the HTML input safe for usage in the editor.
 * This means it removes any tags, attributes and styling we don't understand.
 * It may also translate attributes and tags to things we do understand.
 *
 * @module ember-rdfa-editor
 * @class HTMLInputParser
 */
export default class HTMLInputParser {
  static DEFAULTS = {
    safeAttributes: DEFAULT_SAFE_ATTRIBUTES,
    safeTags: DEFAULT_SAFE_TAGS,
    uriSafeAttributes: DEFAULT_URI_SAFE_ATTRIBUTES,
  };

  private readonly safeAttributes: string[];

  private readonly safeTags: string[];
  private readonly uriSafeAttributes: string[];

  constructor({
    safeAttributes = DEFAULT_SAFE_ATTRIBUTES,
    safeTags = DEFAULT_SAFE_TAGS,
    uriSafeAttributes = DEFAULT_URI_SAFE_ATTRIBUTES,
  }: HTMLInputParserArguments) {
    this.safeAttributes = safeAttributes;

    this.safeTags = safeTags;
    this.uriSafeAttributes = uriSafeAttributes;
  }

  /**
   * Takes an html string, preprocesses its nodes and sanitizes the result.
   * Returns the cleaned html string.
   *
   * @method cleanupHTML
   */
  cleanupHTML(htmlString: string): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(htmlString, 'text/html');
    const rootNode = document.body;

    return DOMPurify.sanitize(rootNode.innerHTML, {
      // ALLOWED_TAGS: this.safeTags,
      // ALLOWED_ATTR: this.safeAttributes,
      IN_PLACE: true,
      // ADD_URI_SAFE_ATTR: this.uriSafeAttributes TODO: does this work?
    });
  }
}
