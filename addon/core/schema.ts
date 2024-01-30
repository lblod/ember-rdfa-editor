import { v4 as uuidv4 } from 'uuid';
import { Attrs, DOMOutputSpec, Mark } from 'prosemirror-model';
import { PNode } from '@lblod/ember-rdfa-editor/index';
import { isSome } from '../utils/_private/option';
import { Backlink, Property } from './rdfa-processor';
import { createLogger } from '@lblod/ember-rdfa-editor/utils/_private/logging-utils';
import { isElement } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import { isFullUri, isPrefixedUri } from '@lblod/marawa/rdfa-helpers';

const logger = createLogger('core/schema');

export const rdfaAttrSpec = {
  properties: { default: [] },
  backlinks: { default: [] },
  __rdfaId: { default: undefined },
  rdfaNodeType: { default: undefined },
  resource: { default: null },
  subject: { default: null },
};
/** @deprecated Renamed to rdfaAttrSpec */
export const rdfaAttrs = rdfaAttrSpec;
export const rdfaDomAttrs = {
  'data-incoming-props': { default: [] },
  'data-outgoing-props': { default: [] },
  resource: { default: null },
  'data-subject': { default: null },
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

export function isRdfaAttrs(attrs: Attrs): attrs is RdfaAttrs {
  return (
    '__rdfaId' in attrs &&
    'backlinks' in attrs &&
    rdfaNodeTypes.includes(attrs.rdfaNodeType)
  );
}

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
      if (key === 'data-subject') {
        attrs['subject'] = value;
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
  for (const prop of properties) {
    const { type, predicate } = prop;
    if (type === 'attribute') {
      if (prop.object && (isFullUri(prop.object) || isPrefixedUri(prop.object))) {
        propElements.push([
          'span',
          { property: predicate, resource: prop.object },
          '',
        ]);
      } else {
        propElements.push([
          'span',
          {
            property: predicate,
            content: prop.object,
            datatype: prop.datatype,
          },
          '',
        ]);
      }
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
): Record<string, string | null> {
  if (nodeOrMark.attrs.rdfaNodeType === 'resource') {
    const contentPred = (nodeOrMark.attrs.properties as Property[]).find(
      (prop) => prop.type === 'content',
    );
    return contentPred
      ? {
          about: (nodeOrMark.attrs.subject ||
            nodeOrMark.attrs.about ||
            nodeOrMark.attrs.resource) as string,
          property: contentPred.predicate,
          resource: null,
        }
      : {
          about: (nodeOrMark.attrs.subject ||
            nodeOrMark.attrs.about ||
            nodeOrMark.attrs.resource) as string,
          resource: null,
        };
  } else {
    const backlinks = nodeOrMark.attrs.backlinks as Backlink[];
    if (!backlinks.length) {
      return {};
    }

    return {
      about: backlinks[0].subject,
      property: backlinks[0].predicate,
      'data-literal-node': 'true',
    };
  }
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
  const clone = { ...attrs };
  delete clone.properties;
  delete clone.backlinks;
  delete clone.subject;
  delete clone.resource;
  delete clone.__rdfaId;
  delete clone.rdfaNodeType;
  return [
    tag,
    { ...clone, ...renderRdfaAttrs(renderable) },
    renderInvisibleRdfa(renderable, rdfaContainerTag, rdfaContainerAttrs),
    [
      contentContainerTag,
      { 'data-content-container': true, ...contentContainerAttrs },
      ...('contentArray' in rest ? rest.contentArray : [rest.content]),
    ],
  ];
}

const findRdfaContentElement = (node: Node) => {
  if (!isElement(node)) {
    throw new Error('node is not an element');
  }
  for (const child of node.children) {
    if ((child as HTMLElement).dataset.contentContainer) {
      return child as HTMLElement;
    }
  }
  return null;
};

export const hasRdfaContentChild = (node: Node) =>
  !!findRdfaContentElement(node);

/**
 * Returns a direct child element with 'data-content-container' attribute. If not found, returns the
 * node itself (to satisfy prosemirror api)
 **/
export const getRdfaContentElement = (node: Node) => {
  return findRdfaContentElement(node) ?? (node as HTMLElement);
};
