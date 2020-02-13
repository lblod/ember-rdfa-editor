import {tagName} from './ce/dom-helpers';

const DEFAULT_SAFE_ATTRIBUTES = ['colspan', 'rowspan', 'title', 'alt', 'cellspacing', 'axis', 'about', 'property', 'datatype', 'typeof', 'resource', 'rel', 'rev', 'content', 'vocab', 'prefix', 'href', 'src'];
const DEFAULT_LUMP_TAGS = [];
const DEFAULT_SAFE_TAGS = ['a', 'br', 'body', 'code', 'data', 'datalist', 'div', 'dl', 'dt', 'dd', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'li', 'link', 'meta', 'nav', 'ol', 'p', 'pre', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'template', 'th', 'thead',  'time', 'tr', 'ul', 'var', 'wbr' ];
const DEFAULT_TAG_MAP = {
  b: 'strong',
  i: 'em',
  del: 's',
  mark: 'span'
};
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
  /**
   * @constructor
   */
  constructor({ safeAttributes, lumpTags, tagMap, safeTags}) {
    this.safeAttributes = safeAttributes ? safeAttributes : DEFAULT_SAFE_ATTRIBUTES;
    this.lumpTags = lumpTags ? lumpTags : DEFAULT_LUMP_TAGS;
    this.safeTags = safeTags ? safeTags : DEFAULT_SAFE_TAGS;
    this.tagMap = tagMap ? tagMap : DEFAULT_TAG_MAP;
  }

  cleanupHTML(html) {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const rootNode = document.body;
    if (!rootNode) {
      // no body was found assume this is a html snippet and take all nodes
    }
    const cleanedNode = this.cleanupNode(rootNode);
    return cleanedNode.innerHTML;
  }

  cleanupNode(node) {
    let cleanedNode;
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = tagName(node);
      if (this.tagMap[tag]) {
        cleanedNode = document.createElement(this.tagMap[tag]);
      }
      else if (!this.safeTags.includes(tag)) {
        if (node.childNodes.length > 0) {
          cleanedNode = document.createElement('div');
        }
      }
      else {
        cleanedNode = document.createElement(tag);
      }

      if (this.lumpTags.includes(tag)) {
        cleanedNode.setAttribute('contenteditable', false);
      }
      for (let attribute of this.safeAttributes) {
        if (node.hasAttribute(attribute))
          cleanedNode.setAttribute(attribute, node.getAttribute(attribute));
      }

      if (node.hasChildNodes()) {
        let children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
          const cleanedChild = this.cleanupNode(children[i]);
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
      if (cleanedNode && cleanedNode.attributes.length == 0 && cleanedNode.childNodes.length == 0 && new String(cleanedNode.textContent).trim().length == 0) {
        return null;
      }
    }
    else if (node.nodeType === Node.TEXT_NODE) {
      cleanedNode = node.cloneNode();
    }
    return cleanedNode;
  }
}

export default HTMLInputParser;
