import DOMPurify from 'dompurify';
import { cleanDocx } from './ce/paste-handler-helper-functions/cleanDocx.ts';
import { preCleanHtml } from '#root/utils/_private/ce/paste-handler-helper-functions/index.ts';

const DEFAULT_SAFE_ATTRIBUTES = [
  'about',
  'accept',
  'action',
  'align',
  'alt',
  'autocomplete',
  'axis',
  'background',
  'bgcolor',
  'border',
  'cellpadding',
  'cellspacing',
  'checked',
  'cite',
  'class',
  'clear',
  'color',
  'cols',
  'colspan',
  'content',
  'coords',
  'crossorigin',
  'datatype',
  'datetime',
  'default',
  'dir',
  'disabled',
  'download',
  'enctype',
  'face',
  'for',
  'headers',
  'height',
  'hidden',
  'high',
  'href',
  'hreflang',
  'id',
  'inlist',
  'integrity',
  'ismap',
  'label',
  'lang',
  'list',
  'loop',
  'low',
  'max',
  'maxlength',
  'media',
  'method',
  'min',
  'multiple',
  'name',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'optimum',
  'pattern',
  'placeholder',
  'poster',
  'prefix',
  'preload',
  'property',
  'pubdate',
  'radiogroup',
  'readonly',
  'rel',
  'required',
  'resource',
  'rev',
  'reversed',
  'role',
  'rows',
  'rowspan',
  'spellcheck',
  'scope',
  'selected',
  'shape',
  'size',
  'sizes',
  'span',
  'srclang',
  'start',
  'src',
  'srcset',
  'step',
  'style',
  'summary',
  'tabindex',
  'title',
  'type',
  'typeof',
  'usemap',
  'valign',
  'value',
  'vocab',
  'width',
  'xmlns',
];

const DEFAULT_URI_SAFE_ATTRIBUTES = [
  'about',
  'content',
  'datatype',
  'inlist',
  'prefix',
  'property',
  'rel',
  'resource',
  'rev',
  'typeof',
  'vocab',
];

const DEFAULT_SAFE_TAGS = [
  'a',
  'abbr',
  'acronym',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'bdi',
  'bdo',
  'big',
  'blink',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'content',
  'data',
  'datalist',
  'dd',
  'decorator',
  'del',
  'details',
  'dfn',
  'dir',
  'div',
  'dl',
  'dt',
  'element',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'font',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'map',
  'mark',
  'marquee',
  'menu',
  'menuitem',
  'meter',
  'nav',
  'nobr',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'section',
  'select',
  'shadow',
  'small',
  'source',
  'spacer',
  'span',
  'strike',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'track',
  'tt',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
];

interface HTMLInputParserArguments {
  safeAttributes?: string[];
  safeTags?: string[];
  uriSafeAttributes?: string[];
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
  private readonly safeAttributes: string[];

  private readonly safeTags: string[];

  private readonly uriSafeAttributes: string[];

  constructor({
    safeAttributes = DEFAULT_SAFE_ATTRIBUTES,
    safeTags = DEFAULT_SAFE_TAGS,
    uriSafeAttributes = DEFAULT_URI_SAFE_ATTRIBUTES,
  }: HTMLInputParserArguments = {}) {
    this.safeAttributes = safeAttributes;
    this.safeTags = safeTags;
    this.uriSafeAttributes = uriSafeAttributes;
  }

  /**
   * Takes an html string, preprocesses its nodes and sanitizes the result.
   * Returns the cleaned html string with any extra attributes we need.
   *
   * @method prepareHTML
   *
   * @param htmlString {string}
   * @param asHTMLNode {boolean}
   * @param doNotClean {boolean} - optionally prevent cleaning input (just sanitize it). This should
   * only be used with html that the editor understands directly, e.g. saved editor contents.
   */
  prepareHTML(
    htmlString: string,
    asHTMLNode?: false,
    doNotClean?: boolean,
  ): string;
  prepareHTML(
    htmlString: string,
    asHTMLNode: true,
    doNotClean?: boolean,
  ): HTMLElement;
  prepareHTML(
    htmlString: string,
    asHTMLNode?: boolean,
    doNotClean?: boolean,
  ): string | HTMLElement {
    const parser = new DOMParser();

    const doc = parser.parseFromString(
      this.preCleanHtml(htmlString),
      'text/html',
    );

    const bodyElement = doc.body;

    if (!doNotClean) {
      this.cleanDocx({ element: bodyElement });
      this.setTableColWidthDataset({ element: bodyElement });
    }
    const sanitized = this.sanitizeHTML({ element: bodyElement });

    if (asHTMLNode) {
      return sanitized;
    }

    return sanitized.innerHTML;
  }

  /**
   * Takes an HTML string and sanitize it.
   * Returns the sanitized HTML string.
   *
   * @method sanitizeHTML
   * @param element {HTMLElement}
   */
  private sanitizeHTML({ element }: { element: HTMLElement }): HTMLElement {
    return DOMPurify.sanitize(element.outerHTML, {
      ALLOWED_TAGS: this.safeTags,
      ALLOWED_ATTR: this.safeAttributes,
      ADD_URI_SAFE_ATTR: this.uriSafeAttributes,
      IN_PLACE: true,
      RETURN_DOM: true,
    }) as HTMLElement;
  }

  private preCleanHtml(html: string): string {
    return preCleanHtml(html);
  }

  private cleanDocx({ element }: { element: HTMLElement }): string {
    return cleanDocx(element);
  }

  /**
   * Sets the `data-colwidth` attribute on `td` elements of first row of each table.
   * This is used by `tableColumnResizingPlugin` to set the initial column widths.
   *
   * Changes are done in place.
   *
   * @param element {HTMLElement}
   */
  private setTableColWidthDataset({ element }: { element: HTMLElement }) {
    // Get all the `tables` elements that have at least one `tr` element.
    const tableElements = Array.from(
      element.getElementsByTagName('table'),
    ).filter(
      (tableElement) => tableElement.getElementsByTagName('tr').length > 0,
    );

    if (!tableElements.length) {
      return;
    }

    tableElements.forEach((tableElement) => {
      const firstTableRowElementWithCells = Array.from(
        tableElement.getElementsByTagName('tr'),
      ).find((trTag) => trTag.getElementsByTagName('td').length > 0);

      if (!firstTableRowElementWithCells) {
        return;
      }

      const cellElements =
        firstTableRowElementWithCells.getElementsByTagName('td');

      const cellWidths = Array.from(cellElements).map((tdTag) =>
        this.getElementWidth(tdTag),
      );

      const totalWidth = cellWidths.reduce((acc, width) => acc + width, 0);

      if (!totalWidth) {
        return;
      }

      for (let i = 0; i < cellElements.length; i++) {
        cellElements[i].dataset['colwidth'] =
          `${(cellWidths[i] / totalWidth) * 100}`;
      }
    });

    return;
  }

  /**
   * Returns the width of the element without the unit.
   * This works for us because we need proportional widths, so we can ignore the unit.
   */
  private getElementWidth(element: HTMLElement): number {
    const attributeWidth = element.getAttribute('width');

    if (attributeWidth) {
      return parseInt(attributeWidth, 10);
    }

    const style = element.getAttribute('style');

    if (style) {
      const width = style.split(';').find((style) => style.includes('width'));
      if (width) {
        return parseInt(width.split(':')[1].trim(), 10);
      }
    }

    return 0;
  }
}
