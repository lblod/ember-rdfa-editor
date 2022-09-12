import XmlReader, {
  XmlReaderResult,
} from '@lblod/ember-rdfa-editor/model/readers/xml-reader';
import ModelNode from '@lblod/ember-rdfa-editor/model/nodes/model-node';
import XmlWriter from '@lblod/ember-rdfa-editor/model/writers/xml-writer';
import { oneLineTrim } from 'common-tags';

export function parseXml(xml: string): XmlReaderResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const reader = new XmlReader();
  return reader.read(doc.firstElementChild!);
}

export function parseXmlSiblings(xml: string): ModelNode[] {
  const parser = new DOMParser();
  const xmlToParse = `<div>${xml}</div>`;
  const doc = parser.parseFromString(xmlToParse, 'application/xml');

  const reader = new XmlReader();
  if (!doc.firstElementChild) {
    throw new Error('Resulting document has no nodes in it');
  }

  const topContainer = reader.read(doc.firstElementChild).root;
  if (!ModelNode.isModelElement(topContainer)) {
    throw new Error('Container is not an element');
  }

  return topContainer.children;
}

export function parseHtml(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

function buildString(strings: TemplateStringsArray, ...expressions: unknown[]) {
  let result = '';

  for (let i = 0; i < expressions.length; i++) {
    result += `${strings[i]}${(
      expressions[i] as Record<string, unknown>
    ).toString()}`;
  }
  result += strings[expressions.length];
  return result;
}

export function vdom(
  strings: TemplateStringsArray,
  ...expressions: unknown[]
): XmlReaderResult {
  const xmlStr = buildString(strings, ...expressions);
  return parseXml(xmlStr);
}

/**
 * Parse string into a {@link Document}
 * @param strings
 * @param expressions
 */
export function dom(strings: TemplateStringsArray, ...expressions: unknown[]) {
  const htmlStr = buildString(strings, ...expressions);
  return parseHtml(htmlStr);
}

/**
 * First convert incoming string into a single-line string with all extra whitespace before and after nodes
 * stripped, then parse it into a {@link Document}
 * @param strings
 * @param expressions
 */

export function domStripped(
  strings: TemplateStringsArray,
  ...expressions: unknown[]
): Document {
  const htmlStr = oneLineTrim(strings, ...expressions);
  return parseHtml(htmlStr);
}

export function printModel(modelNode: ModelNode) {
  const writer = new XmlWriter();
  return writer.write(modelNode);
}
