import DOMPurify from 'dompurify';
import { EditorView } from 'prosemirror-view';

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
  editorView: EditorView;
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
  private readonly editorViewWidth: number;

  private readonly safeAttributes: string[];

  private readonly safeTags: string[];

  private readonly uriSafeAttributes: string[];

  constructor({
    editorView,
    safeAttributes = DEFAULT_SAFE_ATTRIBUTES,
    safeTags = DEFAULT_SAFE_TAGS,
    uriSafeAttributes = DEFAULT_URI_SAFE_ATTRIBUTES,
  }: HTMLInputParserArguments) {
    this.editorViewWidth = this.getEditorViewWidth(editorView);
    this.safeAttributes = safeAttributes;
    this.safeTags = safeTags;
    this.uriSafeAttributes = uriSafeAttributes;
  }

  /**
   * Takes an html string, preprocesses its nodes and sanitizes the result.
   * Returns the cleaned html string with any extra attributes we need.
   *
   * @method prepareHTML
   * @param htmlString {string}
   */
  prepareHTML(htmlString: string) {
    const parser = new DOMParser();
    const document = parser.parseFromString(htmlString, 'text/html');
    const bodyElement = document.body;

    this.setTableColWidthDataset({ element: bodyElement });

    return this.cleanupHTML({ element: bodyElement });
  }

  /**
   * Takes an html string, preprocesses its nodes and sanitizes the result.
   * Returns the cleaned html string.
   *
   * @method cleanupHTML
   * @param element {HTMLElement}
   */
  private cleanupHTML({ element }: { element: HTMLElement }): string {
    return DOMPurify.sanitize(element.innerHTML, {
      ALLOWED_TAGS: this.safeTags,
      ALLOWED_ATTR: this.safeAttributes,
      ADD_URI_SAFE_ATTR: this.uriSafeAttributes,
      IN_PLACE: true,
    });
  }

  /**
   * Sets the `data-colwidth` attribute on `td` elements of first row of each table.
   * This is used by `tableColumnResizingPlugin` to set the initial column widths.
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
      const scaleFactor = this.editorViewWidth / totalWidth;

      for (let i = 0; i < cellWidths.length; i++) {
        cellWidths[i] = Math.round(cellWidths[i] * scaleFactor);
      }

      for (let i = 0; i < cellElements.length; i++) {
        cellElements[i].dataset.colwidth = `${cellWidths[i]}`;
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

  /**
   * An extra hack width to make sure the editor doesn't overflow.
   */
  private static ADDITIONAL_WIDTH_MARGIN = 5;

  /**
   * Returns the width of the editor view minus the padding
   */
  private getEditorViewWidth(view: EditorView): number {
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

    return clientWidthWithoutPadding - HTMLInputParser.ADDITIONAL_WIDTH_MARGIN;
  }
}
