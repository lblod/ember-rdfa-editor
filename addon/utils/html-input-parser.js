import {tagName, invisibleSpace} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import DomPurify from 'dompurify';

const DEFAULT_SAFE_ATTRIBUTES = ['colspan', 'rowspan', 'title', 'alt', 'cellspacing', 'axis', 'about', 'property', 'datatype', 'typeof', 'resource', 'rel', 'rev', 'content', 'vocab', 'prefix', 'href', 'src'];
const DEFAULT_LUMP_TAGS = ["table"];
const DEFAULT_SAFE_TAGS = ['a', 'br', 'body', 'code', 'data', 'datalist', 'div', 'dl', 'dt', 'dd', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'li', 'link', 'meta', 'nav', 'ol', 'p', 'pre', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'template', 'th', 'thead',  'time', 'tr', 'ul', 'var', 'wbr', 'u' ];
const DEFAULT_TAG_MAP = {
  b: 'strong',
  i: 'em',
  del: 's',
  mark: 'span'
};
const DEFAULT_URI_SAFE_ATTRIBUTES = ['about', 'property', 'datatype', 'typeof', 'resource', 'vocab', 'prefix'];
/**
 * A html input parser for the editor
 * The parser makes the HTML input safe for usage in the editor.
 * This means it removes any tags, attributes and styling we don't understand
 * It may also translate attributes and tags to things we do understand
 * @module ember-rdfa-editor
 * @class HTMLInputParser
 * @extends EmberObject
 */
class HTMLInputParser {
  static DEFAULTS = {
    safeAttributes: DEFAULT_SAFE_ATTRIBUTES,
    lumpTags: DEFAULT_LUMP_TAGS,
    safeTags: DEFAULT_SAFE_TAGS,
    tagMap: DEFAULT_TAG_MAP,
    uriSafeAttr: DEFAULT_URI_SAFE_ATTRIBUTES
  }
  /**
   * @constructor
   */
  constructor({ safeAttributes, lumpTags, tagMap, safeTags, uriSafeAttr}) {
    this.safeAttributes = safeAttributes ? safeAttributes : DEFAULT_SAFE_ATTRIBUTES;
    this.lumpTags = lumpTags ? lumpTags : DEFAULT_LUMP_TAGS;
    this.safeTags = safeTags ? safeTags : DEFAULT_SAFE_TAGS;
    this.tagMap = tagMap ? tagMap : DEFAULT_TAG_MAP;
    this.uriSafeAttr = uriSafeAttr ? uriSafeAttr : DEFAULT_URI_SAFE_ATTRIBUTES;
  }

  /**
   * Takes an html string, preproccess its nodes and sanitizes the result.
   * Returns the cleaned html string
   *
   * @method cleanupHTML
   */
  cleanupHTML(html) {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const rootNode = document.body;
    rootNode.normalize();
    const preprocessedNode = this.preprocessNodes(rootNode);
    const cleanedHtml = DomPurify.sanitize(preprocessedNode.innerHTML, {ALLOWED_TAGS: this.safeTags, ALLOWED_ATTR: this.safeAttributes, ADD_URI_SAFE_ATTR: this.uriSafeAttr});
    return cleanedHtml;
  }

  /**
   * Preprocess all nodes replacing the tag if it appears on the tagMap variable
   * and adds the lumpNode property if needed
   *
   * @method preprocessNodes
   */
  preprocessNodes(node) {
    let cleanedNode = node.cloneNode();
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = tagName(node);
      // If we have to replace the tagname we create another node with the new
      // tagname and copy all the attribute of the original node
      if (this.tagMap[tag]) {
        cleanedNode = document.createElement(this.tagMap[tag]);
        this.copyAllAttrs(node, cleanedNode);
      }
      // Clean all node childs
      cleanedNode.textContent = '';
      if (this.lumpTags.includes(tag)) {
        cleanedNode.setAttribute("property", "http://lblod.data.gift/vocabularies/editor/isLumpNode");
      }
      if (node.hasChildNodes()) {
        let children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
          const cleanedChild = this.preprocessNodes(children[i]);
          if (cleanedChild) {
            if (this.lumpTags.includes(tag)) {
              // make sure we can place the cursor before the non editable element
              cleanedNode.appendChild(document.createTextNode(""));
            }
            cleanedNode.appendChild(cleanedChild);
            if (this.lumpTags.includes(tag)) {
              // make sure we can place the cursor after the non editable element
              cleanedNode.appendChild(document.createTextNode(""));
            }
          }
        }
      }
    }
    else if (node.nodeType === Node.TEXT_NODE) {
      // remove invisible whitespace (so keeping non breaking space)
      // \s as per JS [ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff].
      cleanedNode.textContent = node.textContent.replace(invisibleSpace,'')
        .replace(/[ \f\n\r\t\v\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,' ');
      if (cleanedNode.length == 0)
        return null;
    }
    return cleanedNode;
  }

  /**
   * Takes an html string, preproccess its nodes and sanitizes the result.
   * Returns the cleaned html string
   *
   * @method copyAllAttrs
   */
  copyAllAttrs(src, target) {
    for(let attr of src.attributes) {
      target.setAttribute(attr.name, attr.value);
    }
  }
}

export default HTMLInputParser;
