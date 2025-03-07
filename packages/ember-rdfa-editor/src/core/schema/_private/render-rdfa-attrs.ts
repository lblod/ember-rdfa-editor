import type { SayLiteral } from '../../say-data-factory/index.ts';

export function namedNodeSpan(
  subject: string,
  predicate: string,
  resource: string,
) {
  return [
    'span',
    {
      about: subject,
      property: predicate,
      resource: resource,
    },
  ];
}
export function fullLiteralSpan(
  subject: string | null,
  predicate: string,
  object: SayLiteral,
  literalNodeId?: string,
) {
  let result: [string, Record<string, string>, string];
  if (object.language?.length) {
    result = [
      'span',
      {
        property: predicate,
        content: object.value,
        lang: object.language,
      },
      '',
    ];
  } else if (object.datatype?.value?.length) {
    result = [
      'span',
      {
        property: predicate,
        content: object.value,
        datatype: object.datatype.value,
      },
      '',
    ];
  } else {
    result = [
      'span',
      {
        property: predicate,
        content: object.value,
      },
      '',
    ];
  }
  if (subject) {
    result[1]['about'] = subject;
  }
  if (literalNodeId) {
    result[1]['data-literal-node'] = 'true';
    result[1]['data-say-id'] = literalNodeId;
  }
  return result;
}
export function literalSpan(predicate: string, object: SayLiteral) {
  return fullLiteralSpan(null, predicate, object);
}
export function incomingTripleSpan(subject: string, predicate: string) {
  return ['span', { rev: predicate, resource: subject }];
}
