import {invisibleSpace, tagName} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import DOMPurify from "dompurify";

export const DEFAULT_SAFE_ATTRIBUTES = ['colspan', 'rowspan', 'title', 'alt', 'cellspacing', 'axis', 'about', 'property', 'datatype', 'typeof', 'resource', 'rel', 'rev', 'content', 'vocab', 'prefix', 'href', 'src'];
export const DEFAULT_LUMP_TAGS = ["table"];
export const DEFAULT_SAFE_TAGS = ['a', 'br', 'body', 'code', 'data', 'datalist', 'div', 'dl', 'dt', 'dd', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'li', 'link', 'meta', 'nav', 'ol', 'p', 'pre', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'template', 'th', 'thead',  'time', 'tr', 'ul', 'var', 'wbr', 'u' ];
export const DEFAULT_URI_SAFE_ATTRIBUTES = ['about', 'property', 'datatype', 'typeof', 'resource', 'vocab', 'prefix'];
export const DEFAULT_TAG_MAP = new Map([
  ["b", "strong"],
  ["i", "em"],
  ["del", "s"],
  ["mark", "span"]
]);

// limited set of tags we allow for pasting
export const LIMITED_SAFE_TAGS = ['a', 'p', 'br', 'ol', 'ul', 'li', 'strong', 'u', 'em', 's', 'b', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'div', 'span'];

interface HTMLInputParserArguments {
  safeAttributes?: string[],
  lumpTags?: string[],
  safeTags?: string[],
  uriSafeAttributes?: string[],
  tagMap?: Map<string, string>
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
    lumpTags: DEFAULT_LUMP_TAGS,
    safeTags: DEFAULT_SAFE_TAGS,
    uriSafeAttributes: DEFAULT_URI_SAFE_ATTRIBUTES,
    tagMap: DEFAULT_TAG_MAP
  };

  private readonly safeAttributes: string[];
  private readonly lumpTags: string[];
  private readonly safeTags: string[];
  private readonly uriSafeAttributes: string[];
  private readonly tagMap: Map<string, string>;

  constructor({safeAttributes, lumpTags, safeTags, uriSafeAttributes, tagMap}: HTMLInputParserArguments) {
    this.safeAttributes = safeAttributes ? safeAttributes : DEFAULT_SAFE_ATTRIBUTES;
    this.lumpTags = lumpTags ? lumpTags : DEFAULT_LUMP_TAGS;
    this.safeTags = safeTags ? safeTags : DEFAULT_SAFE_TAGS;
    this.uriSafeAttributes = uriSafeAttributes ? uriSafeAttributes : DEFAULT_URI_SAFE_ATTRIBUTES;
    this.tagMap = tagMap ? tagMap : DEFAULT_TAG_MAP;
  }

  /**
   * Takes an html string, preprocesses its nodes and sanitizes the result.
   * Returns the cleaned html string.
   *
   * @method cleanupHTML
   */
  cleanupHTML(htmlString: string): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(htmlString, "text/html");
    const rootNode = document.body;
    rootNode.normalize();

    const preprocessedNode = this.preprocessNode(rootNode) as HTMLElement; // Assumption: root node can never be text
    return DOMPurify.sanitize(preprocessedNode.innerHTML, {
      ALLOWED_TAGS: this.safeTags,
      ALLOWED_ATTR: this.safeAttributes,
      // ADD_URI_SAFE_ATTR: this.uriSafeAttributes TODO: does this work?
    });
  }

  /**
   * Preprocess all nodes replacing the tag if it appears on the tagMap variable
   * and adds the lumpNode property if needed.
   * TODO: check if we can get rid of casts
   *
   * @method preprocessNode
   */
  preprocessNode(node: Node) {
    let cleanedNode = node.cloneNode();
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = tagName(node);
      const tagMapping = this.tagMap.get(tag);

      // If we have to replace the tag name we create another node with the new
      // tag name and copy all the attribute of the original node.
      if (tagMapping) {
        cleanedNode = document.createElement(tagMapping);
        this.copyAllAttributes((node as HTMLElement), (cleanedNode as HTMLElement));
      } else if (tag === "a" && !(cleanedNode as HTMLLinkElement).href) {
        cleanedNode = document.createElement("span");
        this.copyAllAttributes((node as HTMLElement), (cleanedNode as HTMLElement));
      }

      // Clean all children of node.
      cleanedNode.textContent = "";
      if (this.lumpTags.includes(tag)) {
        (cleanedNode as HTMLElement).setAttribute(
          "property",
          "http://lblod.data.gift/vocabularies/editor/isLumpNode"
        );
      }

      if (node.hasChildNodes()) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const cleanedChild = this.preprocessNode(node.childNodes[i]);

          if (cleanedChild) {
            if (this.lumpTags.includes(tag)) {
              // Make sure we can place the cursor before the non editable element.
              cleanedNode.appendChild(document.createTextNode(""));
            }

            cleanedNode.appendChild(cleanedChild);

            if (this.lumpTags.includes(tag)) {
              // Make sure we can place the cursor after the non editable element.
              cleanedNode.appendChild(document.createTextNode(""));
            }
          }
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Remove invisible whitespace (so keeping non breaking space).
      // \s as per JS [ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff].
      if (node.textContent) {
        cleanedNode.textContent = node.textContent
          .replace(invisibleSpace,"")
          .replace(/[ \f\n\r\t\v\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g," ");
      }

      if ((cleanedNode as Text).length === 0) return null;
    }

    return cleanedNode;
  }

  /**
   * Takes a source node and a target node.
   * Copies all attributes from the source node to the target node.
   *
   * @method copyAllAttributes
   */
  copyAllAttributes(source: HTMLElement, target: HTMLElement) {
    for (const attr of source.attributes) {
      target.setAttribute(attr.name, attr.value);
    }
  }
}
