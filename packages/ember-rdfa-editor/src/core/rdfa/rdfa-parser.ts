import { N3StoreWrapper } from '#root/utils/_private/datastore/n3-store-wrapper.ts';
import { isElement, isTextNode } from '#root/utils/_private/dom-helpers.ts';

export interface RdfaParseConfig<N> {
  root: N;

  parseRoot?: boolean;

  textContent(this: void, node: N): string;

  isText(this: void, node: N): boolean;

  children(this: void, node: N): Iterable<N>;

  tag(this: void, node: N): string;

  attributes(this: void, node: N): Record<string, string>;

  baseIRI: string;
  pathFromDomRoot?: Node[];
}
import { RdfaParser } from 'rdfa-streaming-parser';

export function parseRdfa(config: RdfaParseConfig<Node>) {
  const resultSet = new N3StoreWrapper();
  const { pathFromDomRoot = [], root, baseIRI, parseRoot = true } = config;
  const parser = new RdfaParser({ baseIRI, profile: 'html' });

  //@ts-expect-error types
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
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
