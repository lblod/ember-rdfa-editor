import { conciseToRdfjs } from '#root/utils/_private/concise-term-string.ts';
import { NotImplementedError } from '#root/utils/_private/errors.ts';
import type { Quad } from '@rdfjs/types';
import type { DOMOutputSpec } from 'prosemirror-model';
import type { CamelCase, KebabCase } from 'string-ts';
import { kebabCase } from 'string-ts';
import type { KnowledgeBase } from './knowledge-base';
import { isSayId } from './say-id.ts';

export interface SerializeConfig {
  nodeId: string;
  knowledgeBase: KnowledgeBase;
  tag: keyof HTMLElementTagNameMap;
  extraHtmlAttributes?: { [key in keyof HTMLElementAttributes]?: string };
  extraDataAttributes?: Record<CamelCase<string>, string>;
}
function transformDataAttributes(
  camelCased: Record<CamelCase<string>, string>,
): Record<`data-${KebabCase<string>}`, string> {
  const result: Record<`data-${KebabCase<string>}`, string> = {};
  for (const [key, val] of Object.entries(camelCased)) {
    result[`data-${kebabCase(key)}`] = val;
  }
  return result;
}

export function triplesToDatacontainer(
  tag: keyof HTMLElementTagNameMap,
  tripleAttributes: Record<string, string>[],
): DOMOutputSpec {
  const tripleElements = tripleAttributes.map((tripleAttrs) => [
    'span',
    { ...tripleAttrs },
  ]);
  return [
    tag,
    { 'data-rdfa-container': 'true', style: 'display: none;' },
    ...tripleElements,
  ];
}
export function serializeNodeWithId(config: SerializeConfig): DOMOutputSpec {
  const {
    nodeId,
    knowledgeBase,
    extraHtmlAttributes = {},
    extraDataAttributes = {},
    tag,
  } = config;
  const { topLevelAttributes, extraTripleElementAttributes } =
    getRdfaAttrsForNodeId(nodeId, knowledgeBase);

  const finalToplevelAttributes = {
    'data-say-id': nodeId,
    ...topLevelAttributes,
    ...extraHtmlAttributes,
    ...transformDataAttributes(extraDataAttributes),
  };

  let children: (DOMOutputSpec | 0)[];
  if (extraTripleElementAttributes.length) {
    children = [
      triplesToDatacontainer(tag, extraTripleElementAttributes),
      [tag, { 'data-content-container': 'true' }, 0],
    ];
  } else {
    children = [0];
  }

  return [tag, finalToplevelAttributes, ...children];
}

interface SerializationResult {
  topLevelAttributes: Record<string, string>;
  extraTripleElementAttributes: Record<string, string>[];
}
export function getRdfaAttrsForNodeId(
  id: string,
  knowledgeBase: KnowledgeBase,
): SerializationResult {
  const [mainQuadBundle, ...otherQuadBundles] = knowledgeBase.quadsForSayId(id);
  if (otherQuadBundles.length !== 0) {
    throw new NotImplementedError('multiple subjects currently not supported');
  }

  const topLevelAttributes: Record<string, string> = {};
  const mainSubject = mainQuadBundle.subject;
  topLevelAttributes['about'] = mainSubject.value;

  const connectingQuads = mainQuadBundle.connectingQuads;

  topLevelAttributes['property'] = [...connectingQuads]
    .map((q) => q.predicate.value)
    .join(' ');

  let remainingQuads = mainQuadBundle.otherQuads.difference(connectingQuads);

  const typeQuads = remainingQuads.match(null, conciseToRdfjs('a'));

  if (typeQuads.size) {
    topLevelAttributes['typeof'] = [...typeQuads]
      .map((q) => q.object.value)
      .join(' ');
  }
  remainingQuads = remainingQuads
    .difference(typeQuads)
    .filter((q) => !isSayId(q.object.value));
  const extraTripleElementAttributes = [...remainingQuads].map((q) =>
    quadToElementAttributes(q),
  );
  return { topLevelAttributes, extraTripleElementAttributes };
}

function quadToElementAttributes(quad: Quad) {
  const attrs: Record<string, string> = {
    about: quad.subject.value,
    property: quad.predicate.value,
  };
  if (quad.object.termType === 'NamedNode') {
    attrs['resource'] = quad.object.value;
  } else if (quad.object.termType === 'Literal') {
    attrs['content'] = quad.object.value;
  } else {
    throw new NotImplementedError(
      'blanknodes and variables not currently supported',
    );
  }
  return attrs;
}
