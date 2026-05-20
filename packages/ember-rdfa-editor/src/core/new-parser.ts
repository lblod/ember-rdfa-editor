import { N3StoreWrapper } from '#root/utils/_private/datastore/n3-store-wrapper.ts';
import { isElement, isTextNode } from '#root/utils/_private/dom-helpers.ts';
import type { RdfaParseConfig } from '#root/utils/_private/rdfa-parser/rdfa-parser.ts';

import { RdfaParser } from 'rdfa-streaming-parser';

export function parse(config: RdfaParseConfig<Node>) {
  const resultSet = new N3StoreWrapper();
  const { pathFromDomRoot = [], root, baseIRI, parseRoot = true } = config;
  const parser = new RdfaParser({ baseIRI, profile: 'html' });

  //@ts-expect-error types
  parser.on('data', (data) => resultSet.add(data));

  for (const domNode of pathFromDomRoot) {
    if (isElement(domNode)) {
      const attributeObj: Record<string, string> = {};
      for (const attr of domNode.attributes) {
        attributeObj[attr.name] = attr.value;
      }
      parser.onTagOpen(domNode.tagName, attributeObj);
    } else if (isTextNode(domNode)) {
      parser.onText(domNode.textContent || '');
    }
  }
  if (parseRoot) {
    parseRec(root, parser, config);
  }
  for (const _ of pathFromDomRoot) {
    parser.onTagClose();
  }
  parser.onEnd();
  return {
    dataset: new N3StoreWrapper(resultSet),
  };
}

function parseRec(
  node: Node,
  parser: RdfaParser,
  config: RdfaParseConfig<Node>,
) {
  const { isText, textContent, tag, attributes, children } = config;
  if (isText(node)) {
    parser.onText(textContent(node));
    return;
  }
  parser.onTagOpen(tag(node), attributes(node));
  for (const child of children(node)) {
    parseRec(child, parser, config);
  }
  parser.onTagClose();
}
