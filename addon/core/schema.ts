import { v4 as uuidv4 } from 'uuid';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { Attrs, DOMOutputSpec, ParseRule } from 'prosemirror-model';
import { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { PNode } from '@lblod/ember-rdfa-editor/index';

export const rdfaAttrs = {
  properties: { default: {} },
  backlinks: { default: {} },
  __rdfaId: { default: undefined },
};
export const rdfaDomAttrs = {
  'data-incoming-props': { default: [] },
  'data-outgoing-props': { default: [] },
  resource: { default: null },
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
        result['resource'] = rdfaAttrs['resource'];
      }
    }
    if (extraAttrs) {
      return { ...result, ...extraAttrs };
    }
    return result;
  };
}

export function renderProps(node: PNode): DOMOutputSpec {
  const propElements = [];
  const properties = node.attrs.properties as Record<string, OutgoingProp>;
  for (const [pred, prop] of Object.entries(properties)) {
    if (prop.type === 'attr') {
      propElements.push([
        'span',
        {
          property: pred,
          content: prop.object,
          about: node.attrs.resource as string,
        },
        '',
      ]);
    }
  }
  return ['span', { style: 'display: none' }, ...propElements];
}

export function renderAttrs(node: PNode): Record<string, string> {
  const backlinks = node.attrs.backlinks as Record<string, IncomingProp>;
  const entries = Object.entries(backlinks);
  if (entries.length > 1) {
    throw new Error('more than one backlink');
  }
  if (entries.length === 0) {
    return {};
  }
  return {
    property: entries[0][0],
    about: entries[0][1].subject,
  };
}

function copy(obj: Record<string, unknown>) {
  const copy: Record<string, unknown> = {};
  for (const prop in obj) {
    copy[prop] = obj[prop];
  }
  return copy;
}
