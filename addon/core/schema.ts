import { v4 as uuidv4 } from 'uuid';
import { Mark, type Attrs, type DOMOutputSpec } from 'prosemirror-model';
import { PNode } from '@lblod/ember-rdfa-editor/index';
import { isSome, unwrap } from '../utils/_private/option';
import type {
  ContentTriple,
  FullTriple,
  IncomingLiteralNodeTriple,
  IncomingTriple,
  OutgoingTriple,
} from './rdfa-processor';
import { isElement } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import { IMPORTED_RESOURCES_ATTR } from '@lblod/ember-rdfa-editor/plugins/imported-resources';
import {
  findNodesBySubject,
  getBacklinks,
} from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { sayDataFactory } from './say-data-factory';

// const logger = createLogger('core/schema');

export type RdfaAttrConfig = {
  rdfaAware?: boolean;
};

const classicRdfaAttrSpec = {
  vocab: { default: undefined },
  typeof: { default: undefined },
  prefix: { default: undefined },
  property: { default: undefined },
  rel: { default: undefined },
  rev: { default: undefined },
  href: { default: undefined },
  about: { default: undefined },
  resource: { default: undefined },
  content: { default: undefined },
  datatype: { default: undefined },
  lang: { default: undefined },
  xmlns: { default: undefined },
  src: { default: undefined },
  role: { default: undefined },
  inlist: { default: undefined },
  datetime: { default: undefined },
};

const rdfaAwareAttrSpec = {
  properties: { default: [] },
  backlinks: { default: [] },
  metaTriples: { default: [] },
  __rdfaId: { default: undefined },
  rdfaNodeType: { default: undefined },
  subject: { default: null },
};

/** @deprecated `rdfaAttrs` is deprecated, use the `rdfaAttrSpec` function instead */
export const rdfaAttrs = rdfaAttrSpec();

export function rdfaAttrSpec<T extends RdfaAttrConfig>(
  config?: T,
): T extends { rdfaAware: true }
  ? typeof rdfaAwareAttrSpec
  : typeof classicRdfaAttrSpec;
export function rdfaAttrSpec({ rdfaAware = false }: RdfaAttrConfig = {}):
  | false
  | typeof rdfaAwareAttrSpec
  | typeof classicRdfaAttrSpec {
  if (rdfaAware) {
    return rdfaAwareAttrSpec;
  } else {
    return classicRdfaAttrSpec;
  }
}

function getClassicRdfaAttrs(node: Element): Record<string, string> | false {
  const attrs: Record<string, string> = {};
  let hasAnyRdfaAttributes = false;
  for (const key of Object.keys(classicRdfaAttrSpec)) {
    const value = node.attributes.getNamedItem(key)?.value;
    if (isSome(value)) {
      attrs[key] = value;
      hasAnyRdfaAttributes = true;
    }
  }
  if (hasAnyRdfaAttributes) {
    return attrs;
  }
  return false;
}

function getRdfaAwareAttrs(node: HTMLElement): RdfaAttrs | false {
  const rdfaNodeType = node.dataset['rdfaNodeType'] as
    | RdfaAttrs['rdfaNodeType']
    | undefined;
  if (!rdfaNodeType || !rdfaNodeTypes.includes(rdfaNodeType)) {
    return false;
  }
  const __rdfaId = node.getAttribute('__rdfaId') ?? uuidv4();
  let backlinks: IncomingTriple[];
  if (node.dataset['incomingProps']) {
    backlinks = JSON.parse(node.dataset['incomingProps'], (key, value) => {
      if (key === 'object' || key === 'subject') {
        return sayDataFactory.fromTerm(value);
      } else {
        return value;
      }
    }) as IncomingTriple[];
  } else {
    backlinks = [];
  }

  if (rdfaNodeType === 'literal') {
    return {
      rdfaNodeType: 'literal',
      __rdfaId,
      backlinks,
    };
  } else {
    const subject = node.dataset['subject'];
    if (!subject) {
      throw new Error(
        `Node with rdfaNodeType 'resource' does not provide a subject`,
      );
    }
    let properties: OutgoingTriple[];
    if (node.dataset['outgoingProps']) {
      properties = JSON.parse(node.dataset['outgoingProps'], (key, value) => {
        if (key === 'object' || key === 'subject') {
          return sayDataFactory.fromTerm(value);
        } else {
          return value;
        }
      }) as OutgoingTriple[];
    } else {
      properties = [];
    }
    return {
      rdfaNodeType: 'resource',
      subject,
      __rdfaId,
      backlinks,
      properties,
    };
  }
}

export function getRdfaAttrs<T extends RdfaAttrConfig>(
  node: HTMLElement,
  config?: T,
): T extends { rdfaAware: true }
  ? false | RdfaAttrs
  : false | Record<string, string>;
export function getRdfaAttrs(
  node: HTMLElement,
  { rdfaAware = false }: RdfaAttrConfig = {},
): false | RdfaAttrs | Record<string, string> {
  if (rdfaAware) {
    return getRdfaAwareAttrs(node);
  } else {
    return getClassicRdfaAttrs(node);
  }
}
export const rdfaDomAttrs = {
  'data-incoming-props': { default: [] },
  'data-outgoing-props': { default: [] },
  'data-meta-triples': { default: [] },
  'data-subject': { default: null },
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
  subject: string;
  properties: OutgoingTriple[];
}
export type RdfaAttrs = RdfaLiteralAttrs | RdfaResourceAttrs;

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
  editable: true,
};

type NodeOrMark = PNode | Mark;

export function renderInvisibleRdfa(
  nodeOrMark: NodeOrMark,
  tag: string,
  attrs: Record<string, unknown> = {},
): DOMOutputSpec {
  const propElements = [];
  const properties = nodeOrMark.attrs['properties'] as OutgoingTriple[];
  for (const { predicate, object } of properties) {
    switch (object.termType) {
      case 'ContentLiteral':
        // the contentliteral triple gets rendered as main node attributes, so we
        // skip it here
        continue;
      case 'NamedNode':
      case 'BlankNode': {
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
        break;
      }
      case 'ResourceNode': {
        // TODO need a way to make sure links to literals are displayed in the rdfa tools for a
        // document node with imported resources after reload
        // case 'LiteralNode': {
        const importedResources = nodeOrMark.attrs[IMPORTED_RESOURCES_ATTR];
        if (importedResources && 'nodeSize' in nodeOrMark) {
          // This is a document node that imports resources, so we need special handling of those
          // properties
          // continued TODO...
          // let linkedToNodes: ResolvedPNode[];
          // if (object.termType === 'ResourceNode') {
          //   linkedToNodes = findNodesBySubject(nodeOrMark, object.value);
          // } else {
          //   const node = findNodeByRdfaId(nodeOrMark, object.value);
          //   linkedToNodes = node ? [node] : [];
          // }
          const linkedToNodes: ResolvedPNode[] = findNodesBySubject(
            nodeOrMark,
            object.value,
          );
          const backlinkToImportedResource = linkedToNodes
            .flatMap((subj) => getBacklinks(subj.value))
            .find((bl) => bl?.predicate === predicate);
          if (backlinkToImportedResource) {
            propElements.push([
              'span',
              {
                about: backlinkToImportedResource.subject.value,
                property: predicate,
                resource: object.value,
              },
            ]);
          }
        }
        break;
      }
      case 'Literal': {
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
        break;
      }
    }
  }
  if (nodeOrMark.attrs['rdfaNodeType'] === 'resource') {
    const backlinks = nodeOrMark.attrs['backlinks'] as IncomingTriple[];
    for (const { predicate, subject } of backlinks) {
      propElements.push(['span', { rev: predicate, resource: subject.value }]);
    }
  }
  return [
    tag,
    {
      style: 'display: none',
      class: 'say-hidden',
      'data-rdfa-container': true,
      ...attrs,
    },
    ...propElements,
  ];
}

export function renderRdfaAttrs(
  rdfaAttrs: RdfaAttrs,
): Record<string, string | null> {
  if (rdfaAttrs.rdfaNodeType === 'resource') {
    const contentTriple: ContentTriple | null = rdfaAttrs.properties.find(
      (prop) => prop.object.termType === 'ContentLiteral',
    ) as ContentTriple | null;

    return contentTriple
      ? {
          about: rdfaAttrs.subject,
          property: contentTriple.predicate,
          datatype: contentTriple.object.language.length
            ? null
            : contentTriple.object.datatype.value,
          lang: contentTriple.object.language,

          resource: null,
        }
      : {
          about: rdfaAttrs.subject,
          resource: null,
        };
  } else {
    const backlinks = rdfaAttrs.backlinks as IncomingLiteralNodeTriple[];
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

function determineChildTag(renderable: Mark | PNode) {
  if (renderable instanceof Mark) {
    return 'span';
  } else {
    return renderable.inlineContent || renderable.isInline ? 'span' : 'div';
  }
}
export function renderRdfaAware({
  renderable,
  tag,
  attrs = {},
  rdfaContainerTag = determineChildTag(renderable),
  rdfaContainerAttrs,
  contentContainerTag = determineChildTag(renderable),
  contentContainerAttrs = {},
  ...rest
}: RdfaRenderArgs): DOMOutputSpec {
  const clone = { ...attrs };

  //TODO: this should not be needed
  delete clone['properties'];
  delete clone['backlinks'];
  delete clone['subject'];
  delete clone['resource'];
  delete clone['__rdfaId'];
  delete clone['rdfaNodeType'];

  return [
    tag,
    { ...clone, ...renderRdfaAttrs(renderable.attrs as RdfaAttrs) },
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

export const findRdfaHiddenElements = (node: Node) => {
  if (!isElement(node)) {
    throw new Error('node is not an element');
  }
  for (const child of node.children) {
    if ((child as HTMLElement).dataset['rdfaContainer']) {
      return (child as HTMLElement).children;
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
