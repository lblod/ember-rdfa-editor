/* eslint-disable */
//@ts-nocheck
import * as QUnit from 'qunit';

const defaultParse: (
  this: unknown,
  data: unknown,
  objType: unknown,
  stack: unknown,
) => string = QUnit.dump.parse;

/**
 * Very badly written but useful stringifier for xml/html-nodes in QUnit tests
 * @param node
 */
export function nodeParser(node: Node) {
  const result = [];
  QUnit.dump.up();
  const maxDepth = QUnit.dump.maxDepth;
  const open = QUnit.dump.HTML ? '&lt;' : '<';
  const close = QUnit.dump.HTML ? '&gt;' : '>';
  if (
    node.nodeType === Node.TEXT_NODE ||
    node.nodeType === Node.CDATA_SECTION_NODE
  ) {
    result.push(node.nodeValue);
  } else {
    const tag = node.nodeName.toLowerCase();
    // Section copied from default qunit node parser ->

    let ret = open + tag;
    const attrs = node.attributes;

    if (attrs) {
      for (let i = 0, len = attrs.length; i < len; i++) {
        const val = attrs[i].nodeValue; // IE6 includes all attributes in .attributes, even ones not explicitly
        // set. Those have values like undefined, null, 0, false, "" or
        // "inherit".

        if (val && val !== 'inherit') {
          ret += ` ${attrs[i].nodeName}=${QUnit.dump.parse(val, 'attribute')}`;
        }
      }
    }

    ret += close;

    // <- Section copied from default qunit node parser
    for (let i = 3; i < QUnit.dump.depth; i++) {
      result.push('\t');
    }
    result.push(ret);

    if (
      maxDepth &&
      QUnit.dump.depth > maxDepth &&
      node.childNodes.length &&
      tag !== 'text'
    ) {
      result.push('\n');
      let val = '';
      for (let i = 3; i < QUnit.dump.depth + 1; i++) {
        val += '\t';
      }
      result.push(`${val}[${node.childNodes.length} childNodes]`);
    } else {
      for (const child of node.childNodes) {
        if (tag !== 'text') {
          result.push('\n');
        }
        result.push(nodeParser(child));
      }
    }
    if (node.childNodes.length > 0 && tag !== 'text') {
      result.push('\n');
      for (let i = 3; i < QUnit.dump.depth; i++) {
        result.push('\t');
      }
    }
    result.push(`${open}/${tag}${close}`);
  }

  QUnit.dump.down();
  return result.join('');
}
