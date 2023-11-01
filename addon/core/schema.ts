import { v4 as uuidv4 } from 'uuid';
import {
  IncomingProp,
  OutgoingProp,
} from '@lblod/ember-rdfa-editor/core/say-parser';
import { Attrs, DOMOutputSpec, Mark, ParseRule } from 'prosemirror-model';
import { Option } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { PNode } from '@lblod/ember-rdfa-editor/index';

export const rdfaAttrs = {
  properties: { default: [] },
  backlinks: { default: [] },
  __rdfaId: { default: undefined },
  rdfaNodeType: { default: undefined },
  resource: { default: null },
};
export const rdfaDomAttrs = {
  'data-incoming-props': { default: [] },
  'data-outgoing-props': { default: [] },
  resource: { default: null },
  __rdfaId: { default: undefined },
  'data-rdfa-node-type': { default: undefined },
};

type RdfaAttrs = Record<string, string | OutgoingProp[] | IncomingProp[]>;

export function getRdfaAttrs(node: Element): RdfaAttrs | false {
  const attrs: RdfaAttrs = {};

  let hasAnyRdfaAttributes = false;
  for (const key of Object.keys(rdfaDomAttrs)) {
    const value = node.attributes.getNamedItem(key)?.value;
    if (value) {
      attrs[key] = value;
      hasAnyRdfaAttributes = true;

      if (key === 'data-outgoing-props') {
        const properties = JSON.parse(value) as OutgoingProp[];
        attrs['properties'] = properties;
      }
      if (key === 'data-incoming-props') {
        const backlinks = JSON.parse(value) as IncomingProp[];
        attrs['backlinks'] = backlinks;
      }
      if (key === 'data-rdfa-node-type') {
        attrs['rdfaNodeType'] = value;
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

type NodeOrMark = PNode | Mark;
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
        result['rdfaNodeType'] = rdfaAttrs['rdfaNodeType'];
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

export function renderInvisibleRdfa(
  nodeOrMark: NodeOrMark,
  tag: string,
  attrs: Record<string, unknown> = {},
): DOMOutputSpec {
  const propElements = [];
  const properties = nodeOrMark.attrs.properties as OutgoingProp[];
  for (const { type, predicate, object } of properties) {
    if (type === 'attr') {
      propElements.push(['span', { property: predicate, content: object }, '']);
    }
  }
  if (nodeOrMark.attrs.rdfaNodeType === 'resource') {
    const backlinks = nodeOrMark.attrs.backlinks as IncomingProp[];
    for (const { predicate, subject } of backlinks) {
      propElements.push(['span', { rev: predicate, resource: subject }]);
    }
  }
  return [
    tag,
    { style: 'display: none', 'data-rdfa-container': true, ...attrs },
    ...propElements,
  ];
}

export function renderRdfaAttrs(
  nodeOrMark: NodeOrMark,
): Record<string, string> {
  if (nodeOrMark.attrs.rdfaNodeType !== 'resource') {
    const backlinks = nodeOrMark.attrs.backlinks as IncomingProp[];
    if (backlinks.length > 1) {
      throw new Error('more than one backlink');
    }
    if (!backlinks.length) {
      return {};
    }

    return {
      about: backlinks[0].subject,
      property: backlinks[0].predicate,
    };
  }
  return {};
}

export interface RenderContentArgs {
  tag: keyof HTMLElementTagNameMap;
  extraAttrs?: Record<string, unknown>;
  content: DOMOutputSpec;
}
export interface RdfaRenderArgs {
  renderable: NodeOrMark;
  tag: string;
  attrs?: Record<string, unknown>;
  rdfaContainerTag?: string;
  rdfaContainerAttrs?: Record<string, unknown>;
  contentContainerTag?: string;
  contentContainerAttrs?: Record<string, unknown>;
  content?: DOMOutputSpec | 0;
}
export function renderRdfaAware({
  renderable,
  tag,
  attrs = {},
  rdfaContainerTag = tag,
  rdfaContainerAttrs,
  contentContainerTag = tag,
  contentContainerAttrs = {},
  content,
}: RdfaRenderArgs): DOMOutputSpec {
  return [
    tag,
    { class: 'say-editable', ...attrs, ...renderRdfaAttrs(renderable) },
    renderInvisibleRdfa(renderable, rdfaContainerTag, rdfaContainerAttrs),
    [
      contentContainerTag,
      { 'data-content-container': true, ...contentContainerAttrs },
      content,
    ],
  ];
}
function copy(obj: Record<string, unknown>) {
  const copy: Record<string, unknown> = {};
  for (const prop in obj) {
    copy[prop] = obj[prop];
  }
  return copy;
}
