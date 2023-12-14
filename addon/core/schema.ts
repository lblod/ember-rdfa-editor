import { v4 as uuidv4 } from 'uuid';
import { DOMOutputSpec, Mark } from 'prosemirror-model';
import { PNode } from '@lblod/ember-rdfa-editor/index';
import { isSome } from '../utils/_private/option';
import { Backlink, Property } from './rdfa-processor';
import { createLogger } from '@lblod/ember-rdfa-editor/utils/_private/logging-utils';

const logger = createLogger('core/schema');

export const rdfaAttrSpec = {
  properties: { default: [] },
  backlinks: { default: [] },
  __rdfaId: { default: undefined },
  rdfaNodeType: { default: undefined },
  resource: { default: null },
};
/** @deprecated Renamed to rdfaAttrSpec */
export const rdfaAttrs = rdfaAttrSpec;
export const rdfaDomAttrs = {
  'data-incoming-props': { default: [] },
  'data-outgoing-props': { default: [] },
  resource: { default: null },
  about: { default: null },
  __rdfaId: { default: undefined },
  'data-rdfa-node-type': { default: undefined },
};

export const rdfaNodeTypes = ['resource', 'literal'] as const;
export interface RdfaAwareAttrs {
  __rdfaId: string;
  rdfaNodeType: (typeof rdfaNodeTypes)[number];
  backlinks: Backlink[];
}
export interface RdfaLiteralAttrs extends RdfaAwareAttrs {
  rdfaNodeType: 'literal';
}
export interface RdfaResourceAttrs extends RdfaAwareAttrs {
  rdfaNodeType: 'resource';
  resource: string;
  properties: Property[];
}
export type RdfaAttrs = (RdfaLiteralAttrs | RdfaResourceAttrs) &
  Record<string, string | number | Property[] | Backlink[]>;

export const sharedRdfaNodeSpec = {
  isolating: true,
  selectable: true,
};

export function getRdfaAttrs(node: Element): RdfaAttrs | false {
  let attrs: RdfaAttrs = {
    __rdfaId: '',
    rdfaNodeType: 'literal',
    backlinks: [],
  };

  let hasAnyRdfaAttributes = false;
  if (!node.hasAttribute('data-rdfa-node-type')) {
    return false;
  }
  for (const key of Object.keys(rdfaDomAttrs)) {
    const value = node.attributes.getNamedItem(key)?.value;
    if (isSome(value)) {
      attrs[key] = value;
      hasAnyRdfaAttributes = true;

      if (key === 'data-outgoing-props') {
        const properties = JSON.parse(value) as Property[];
        attrs['properties'] = properties;
      }
      if (key === 'data-incoming-props') {
        const backlinks = JSON.parse(value) as Backlink[];
        attrs['backlinks'] = backlinks;
      }
      if (key === 'data-rdfa-node-type') {
        const type = value as unknown as RdfaAttrs['rdfaNodeType'];
        if (!rdfaNodeTypes.includes(type)) {
          logger('rdfaNodeType is not a valid type', value, node);
        }
        if (type === 'resource') {
          // Attrs of resource nodeTypes have non-optional resource and properties fields, so
          // ensure that they're set, either to the already parsed values or []/''
          attrs = {
            ...attrs,
            rdfaNodeType: type,
            resource:
              attrs.resource && typeof attrs.resource === 'string'
                ? attrs.resource
                : attrs.about && typeof attrs.about === 'string'
                ? attrs.about
                : '',
            properties:
              attrs.properties && attrs.properties instanceof Array
                ? (attrs.properties as Property[])
                : [],
          };
        }
      }
    }
  }
  if (hasAnyRdfaAttributes) {
    if (!attrs['__rdfaId']) {
      attrs['__rdfaId'] = uuidv4();
      logger('No rdfaId found, generating one', attrs['__rdfaId'], attrs);
    }
    return attrs;
  }
  return false;
}

type NodeOrMark = PNode | Mark;

export function renderInvisibleRdfa(
  nodeOrMark: NodeOrMark,
  tag: string,
  attrs: Record<string, unknown> = {},
): DOMOutputSpec {
  const propElements = [];
  const properties = nodeOrMark.attrs.properties as Property[];
  for (const { type, predicate, object } of properties) {
    if (type === 'attribute') {
      propElements.push(['span', { property: predicate, content: object }, '']);
    }
  }
  if (nodeOrMark.attrs.rdfaNodeType === 'resource') {
    const backlinks = nodeOrMark.attrs.backlinks as Backlink[];
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
    const backlinks = nodeOrMark.attrs.backlinks as Backlink[];
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
export type RdfaRenderArgs = {
  renderable: NodeOrMark;
  tag: string;
  attrs?: Record<string, unknown>;
  rdfaContainerTag?: string;
  rdfaContainerAttrs?: Record<string, unknown>;
  contentContainerTag?: string;
  contentContainerAttrs?: Record<string, unknown>;
} & ({ content: DOMOutputSpec | 0 } | { contentArray: unknown[] });
export function renderRdfaAware({
  renderable,
  tag,
  attrs = {},
  rdfaContainerTag = tag,
  rdfaContainerAttrs,
  contentContainerTag = tag,
  contentContainerAttrs = {},
  ...rest
}: RdfaRenderArgs): DOMOutputSpec {
  return [
    tag,
    { ...attrs, ...renderRdfaAttrs(renderable) },
    renderInvisibleRdfa(renderable, rdfaContainerTag, rdfaContainerAttrs),
    [
      contentContainerTag,
      { 'data-content-container': true, ...contentContainerAttrs },
      ...('contentArray' in rest ? rest.contentArray : [rest.content]),
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
