import { v4 as uuidv4 } from 'uuid';
import type { Attrs, DOMOutputSpec, Mark } from 'prosemirror-model';
import { PNode } from '@lblod/ember-rdfa-editor/index';
import { isSome, unwrap } from '../utils/_private/option';
import type {
  ContentTriple,
  IncomingLiteralNodeTriple,
  IncomingTriple,
  OutgoingTriple,
} from './rdfa-processor';
import { createLogger } from '@lblod/ember-rdfa-editor/utils/_private/logging-utils';
import { isElement } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';

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
  backlinks: IncomingTriple[];
}
export interface RdfaLiteralAttrs extends RdfaAwareAttrs {
  rdfaNodeType: 'literal';
}
export interface RdfaResourceAttrs extends RdfaAwareAttrs {
  rdfaNodeType: 'resource';
  resource: string;
  properties: OutgoingTriple[];
}
export type RdfaAttrs = (RdfaLiteralAttrs | RdfaResourceAttrs) &
  Record<string, string | number | OutgoingTriple[] | IncomingTriple[]>;

export function isRdfaAttrs(attrs: Attrs): attrs is RdfaAttrs {
  return (
    '__rdfaId' in attrs &&
    'backlinks' in attrs &&
    rdfaNodeTypes.includes(attrs['rdfaNodeType'])
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
        const properties = JSON.parse(value) as OutgoingTriple[];
        attrs['properties'] = properties;
      }
      if (key === 'data-incoming-props') {
        const backlinks = JSON.parse(value) as IncomingTriple[];
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
              attrs['resource'] && typeof attrs['resource'] === 'string'
                ? attrs['resource']
                : attrs['about'] && typeof attrs['about'] === 'string'
                  ? attrs['about']
                  : '',
            properties:
              attrs['properties'] && attrs['properties'] instanceof Array
                ? (attrs['properties'] as OutgoingTriple[])
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
  const properties = nodeOrMark.attrs['properties'] as OutgoingTriple[];
  for (const { predicate, object } of properties) {
    if (object.termType === 'ContentLiteral') {
      // the contentliteral triple gets rendered as main node attributes, so we
      // skip it here
      continue;
    }
    if (object.termType === 'NamedNode' || object.termType === 'BlankNode') {
      // the triple refers to a URI which does not have a corresponding
      // resource node
      const subject: string = unwrap(nodeOrMark.attrs['subject'] as string);
      propElements.push([
        'span',
        {
          about: subject,
          property: predicate,
          resource: object.value,
        },
      ]);
    } else if (object.termType === 'Literal') {
      if (object.language?.length) {
        propElements.push([
          'span',
          {
            property: predicate,
            content: object.value,
            lang: object.language,
          },
          '',
        ]);
      } else if (object.datatype?.value?.length) {
        propElements.push([
          'span',
          {
            property: predicate,
            content: object.value,
            datatype: object.datatype.value,
          },
          '',
        ]);
      } else {
        propElements.push([
          'span',
          {
            property: predicate,
            content: object.value,
          },
          '',
        ]);
      }
    }
  }
  if (nodeOrMark.attrs['rdfaNodeType'] === 'resource') {
    const backlinks = nodeOrMark.attrs['backlinks'] as IncomingTriple[];
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
  if (nodeOrMark.attrs['rdfaNodeType'] === 'resource') {
    const contentTriple: ContentTriple | null = (
      nodeOrMark.attrs['properties'] as OutgoingTriple[]
    ).find(
      (prop) => prop.object.termType === 'ContentLiteral',
    ) as ContentTriple | null;

    return contentTriple
      ? {
          about: (nodeOrMark.attrs['subject'] ||
            nodeOrMark.attrs['about'] ||
            nodeOrMark.attrs['resource']) as string,
          property: contentTriple.predicate,
          datatype: contentTriple.object.language.length
            ? null
            : contentTriple.object.datatype.value,
          lang: contentTriple.object.language,

          resource: null,
        }
      : {
          about: (nodeOrMark.attrs['subject'] ||
            nodeOrMark.attrs['about'] ||
            nodeOrMark.attrs['resource']) as string,
          resource: null,
        };
  } else {
    const backlinks = nodeOrMark.attrs[
      'backlinks'
    ] as IncomingLiteralNodeTriple[];
    if (!backlinks.length) {
      return {};
    }

    return {
      about: backlinks[0].subject.value,
      property: backlinks[0].predicate,
      datatype: backlinks[0].subject.language.length
        ? null
        : backlinks[0].subject.datatype.value,
      lang: backlinks[0].subject.language,
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
  delete clone['properties'];
  delete clone['backlinks'];
  delete clone['subject'];
  delete clone['resource'];
  delete clone['__rdfaId'];
  delete clone['rdfaNodeType'];
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
    if ((child as HTMLElement).dataset['contentContainer']) {
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
