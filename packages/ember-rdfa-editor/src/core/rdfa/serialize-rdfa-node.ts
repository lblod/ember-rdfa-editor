import { conciseToRdfjs } from '#root/utils/_private/concise-term-string.ts';
import type { Quad } from '@rdfjs/types';
import type { KnowledgeBase } from './knowledgebase';
import { NotImplementedError } from '#root/utils/_private/errors.ts';

interface SerializationResult {
  topLevelAttributes: Record<string, string>;
  extraTripleElementAttributes: Record<string, string>[];
}
export function serializeNodeId(
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
  topLevelAttributes['typeof'] = [...typeQuads]
    .map((q) => q.object.value)
    .join(' ');
  remainingQuads = remainingQuads.difference(typeQuads);
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
