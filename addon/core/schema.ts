import { v4 as uuidv4 } from 'uuid';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { Attrs, ParseRule } from 'prosemirror-model';
import { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';

export const rdfaAttrs = {
  properties: { default: {} },
  backlinks: { default: {} },
  __rdfaId: { default: undefined },
};
export const rdfaDomAttrs = {
  'data-incoming-props': { default: [] },
  'data-outgoing-props': { default: [] },
  __rdfaId: { default: undefined },
};
type OutgoingMap = Record<string, OutgoingProp>;
type IncomingMap = Record<string, IncomingProp>;

export function getRdfaAttrs(
  node: Element,
): Record<string, string | OutgoingMap | IncomingMap> | false {
  const attrs: Record<string, string | OutgoingMap | IncomingMap> = {};

  let hasAnyRdfaAttributes = false;
  for (const key of Object.keys(rdfaDomAttrs)) {
    const value = node.attributes.getNamedItem(key)?.value;
    if (value) {
      attrs[key] = value;
      hasAnyRdfaAttributes = true;

      if (key === 'data-outgoing-props') {
        const properties: OutgoingMap = {};
        const props = JSON.parse(value) as OutgoingProp[];
        for (const prop of props) {
          properties[prop.predicate] = prop;
        }
        attrs['properties'] = properties;
      }
      if (key === 'data-incoming-props') {
        const backlinks: IncomingMap = {};
        const props = JSON.parse(value) as IncomingProp[];
        for (const prop of props) {
          backlinks[prop.predicate] = prop;
        }
        attrs['backlinks'] = backlinks;
      }
    }
  }
  if (hasAnyRdfaAttributes) {
    if (!attrs['__rdfaId']) {
      attrs['__rdfaId'] = uuidv4();
    }
    return attrs;
  }
  return false;
}

export function enhanceRule(rule: ParseRule): ParseRule {
  const newRule = copy(rule as Record<string, unknown>) as ParseRule;
  newRule.getAttrs = wrapGetAttrs(newRule.getAttrs, newRule.attrs);
  return newRule;
}

type GetAttrs = (node: string | HTMLElement) => false | Attrs | null;

function wrapGetAttrs(
  getAttrs: Option<GetAttrs>,
  extraAttrs: Option<Record<string, unknown>>,
): GetAttrs {
  return function (node: string | HTMLElement) {
    const originalAttrs: Record<string, unknown> | false | null = getAttrs
      ? getAttrs(node)
      : {};
    if (originalAttrs === false) {
      return originalAttrs;
    }
    const result = originalAttrs ?? {};
    if (typeof node !== 'string' && typeof result === 'object') {
      const rdfaAttrs = getRdfaAttrs(node);
      if (rdfaAttrs) {
        result['__rdfaId'] = rdfaAttrs['__rdfaId'];
        result['properties'] = rdfaAttrs['properties'];
        result['backlinks'] = rdfaAttrs['backlinks'];
      }
    }
    if (extraAttrs) {
      return { ...result, ...extraAttrs };
    }
    return result;
  };
}

function copy(obj: Record<string, unknown>) {
  const copy: Record<string, unknown> = {};
  for (const prop in obj) {
    copy[prop] = obj[prop];
  }
  return copy;
}
