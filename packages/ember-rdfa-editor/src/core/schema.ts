import { v4 as uuidv4 } from 'uuid';
import { Mark, type DOMOutputSpec } from 'prosemirror-model';
import { PNode } from '#root/prosemirror-aliases.ts';
import { isSome, unwrap, type Option } from '../utils/_private/option.ts';
import type {
  ContentTriple,
  FullTriple,
  IncomingTriple,
  OutgoingTriple,
} from './rdfa-processor.ts';
import { isElement } from '#root/utils/_private/dom-helpers.ts';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';
import { getSubjectsFromBacklinksOfRelationship } from '#root/utils/rdfa-utils.ts';
import {
  languageOrDataType,
  sayDataFactory,
  type SayTerm,
  type WithoutEquals,
} from './say-data-factory/index.ts';
import {
  fullLiteralSpan,
  incomingTripleSpan,
  literalSpan,
  namedNodeSpan,
} from './schema/_private/render-rdfa-attrs.ts';
import { IllegalArgumentError } from '../utils/_private/errors.ts';
import type { NamedNode } from '@rdfjs/types';
import { rdfaNodeTypes, type RdfaAttrs } from '#root/core/rdfa-types.ts';

// const logger = createLogger('core/schema');

// Exports for backwards compatibility
export {
  rdfaNodeTypes,
  type RdfaAwareAttrs,
  type RdfaLiteralAttrs,
  type RdfaResourceAttrs,
  type RdfaAttrs,
  isRdfaAttrs,
} from './rdfa-types.ts';

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
  externalTriples: { default: [] },
  __rdfaId: { default: undefined },
  rdfaNodeType: { default: undefined },
  subject: { default: null },
  content: { default: null, editable: true },
  datatype: { default: null },
  language: { default: null, editable: true },
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
  let rdfaNodeType = node.dataset['rdfaNodeType'] as
    | RdfaAttrs['rdfaNodeType']
    | undefined;
  if (!rdfaNodeType && node.dataset['literalNode'] === 'true') {
    rdfaNodeType = 'literal';
  }
  if (!rdfaNodeType || !rdfaNodeTypes.includes(rdfaNodeType)) {
    return false;
  }
  const __rdfaId = node.dataset['sayId'] ?? uuidv4();
  let backlinks: IncomingTriple[] = [];
  if (node.dataset['incomingProps']) {
    backlinks = JSON.parse(
      node.dataset['incomingProps'],
      jsonToTerm,
    ) as IncomingTriple[];
  }

  let externalTriples: FullTriple[] = [];
  if (node.dataset['externalTriples']) {
    externalTriples = JSON.parse(
      node.dataset['externalTriples'],
      jsonToTerm,
    ) as FullTriple[];
  }
  if (rdfaNodeType === 'literal') {
    const datatype = node.getAttribute('datatype');
    let transformedDatatype = null;
    if (datatype) {
      transformedDatatype = sayDataFactory.namedNode(datatype);
    }

    return {
      rdfaNodeType: 'literal',
      content: node.getAttribute('content'),
      datatype: transformedDatatype,
      language: node.getAttribute('lang') ?? null,
      __rdfaId,
      backlinks,
      externalTriples,
    };
  } else {
    const subject = node.dataset['subject'];
    if (!subject) {
      throw new Error(
        `Node with rdfaNodeType 'resource' does not provide a subject`,
      );
    }
    let properties: OutgoingTriple[] = [];
    if (node.dataset['outgoingProps']) {
      properties = JSON.parse(
        node.dataset['outgoingProps'],
        jsonToTerm,
      ) as OutgoingTriple[];
    }

    return {
      rdfaNodeType: 'resource',
      subject,
      __rdfaId,
      backlinks,
      externalTriples,
      properties,
    };
  }
}

function jsonToTerm(key: string, value: WithoutEquals<SayTerm>) {
  if (key === 'object' || key === 'subject') {
    return sayDataFactory.fromTerm(value);
  } else {
    return value;
  }
}

export function getRdfaAwareDocAttrs(
  node: HTMLElement,
  { hasResourceImports = false } = {},
) {
  if (!node.dataset['sayDocument']) {
    throw new IllegalArgumentError('node is not a doc node');
  }

  let backlinks: IncomingTriple[] = [];
  if (node.dataset['incomingProps']) {
    backlinks = JSON.parse(
      node.dataset['incomingProps'],
      jsonToTerm,
    ) as IncomingTriple[];
  }

  let properties: OutgoingTriple[] = [];
  const subject = node.dataset['subject'];
  if (node.dataset['outgoingProps']) {
    properties = JSON.parse(
      node.dataset['outgoingProps'],
      jsonToTerm,
    ) as OutgoingTriple[];
  }
  if (hasResourceImports) {
    const hidden = findRdfaHiddenElements(node);
    if (hidden) {
      const imports = new Map<string, OutgoingTriple[]>();
      for (const hid of hidden) {
        const hiddenRdfaAttrs = getRdfaAttrs(hid as HTMLElement, {
          rdfaAware: true,
        });
        // Since 'getRdfaAttrs' returns the properties for the resource URI, not the node, it
        // actually gives us *all* of the properties for each hidden element. We need to
        // de-duplicate these so we only get each set once, per imported resource.
        // It might make more sense to do this in the rdfa-processor, e.g. in the preprocessRDFa()
        // function
        if (hiddenRdfaAttrs && 'properties' in hiddenRdfaAttrs) {
          imports.set(hiddenRdfaAttrs.subject, hiddenRdfaAttrs.properties);
        }
      }
      properties.push(...[...imports.values()].flat());
    }
  }
  let externalTriples: FullTriple[] = [];
  if (node.dataset['externalTriples']) {
    externalTriples = JSON.parse(
      node.dataset['externalTriples'],
      jsonToTerm,
    ) as FullTriple[];
  }

  return {
    backlinks,
    externalTriples,
    subject,
    properties,
  };
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
  'data-external-triples': { default: [] },
  'data-subject': { default: null },
  __rdfaId: { default: undefined },
  'data-rdfa-node-type': { default: undefined },
};

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
        if (!isSome(nodeOrMark.attrs['subject'])) {
          console.warn(
            'Trying to render a BlankNode with no subject, ignoring',
            nodeOrMark.attrs,
          );
          break;
        }
        const subject: string = unwrap(nodeOrMark.attrs['subject'] as string);
        propElements.push(namedNodeSpan(subject, predicate, object.value));
        break;
      }
      case 'ResourceNode': {
        // TODO need a way to make sure links to literals are displayed in the rdfa tools for a
        // document node with imported resources after reload
        // case 'LiteralNode': {
        const importedResources = nodeOrMark.attrs[IMPORTED_RESOURCES_ATTR] as
          | string[]
          | undefined;
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
          const subjects = getSubjectsFromBacklinksOfRelationship(
            nodeOrMark,
            importedResources,
            predicate,
            object,
          );
          subjects.forEach((subject) => {
            propElements.push(namedNodeSpan(subject, predicate, object.value));
          });
        }
        break;
      }
      case 'Literal': {
        propElements.push(literalSpan(predicate, object));
        break;
      }
    }
  }
  const externalTriples = nodeOrMark.attrs['externalTriples'] as FullTriple[];
  if (externalTriples.length) {
    const externalElements = [];
    for (const fullTriple of externalTriples) {
      switch (fullTriple.object.termType) {
        case 'NamedNode':
          externalElements.push(
            namedNodeSpan(
              fullTriple.subject.value,
              fullTriple.predicate,
              fullTriple.object.value,
            ),
          );
          break;
        case 'Literal':
          externalElements.push(
            fullLiteralSpan(
              fullTriple.subject.value,
              fullTriple.predicate,
              fullTriple.object,
            ),
          );
          break;
      }
    }
    propElements.push([
      'span',
      { 'data-external-triple-container': true },
      ...externalElements,
    ]);
  }
  if (nodeOrMark.attrs['rdfaNodeType'] === 'resource') {
    const backlinks = nodeOrMark.attrs['backlinks'] as IncomingTriple[];
    for (const { predicate, subject } of backlinks) {
      propElements.push(incomingTripleSpan(subject.value, predicate));
    }
  } else if (nodeOrMark.attrs['rdfaNodeType'] === 'literal') {
    const backlinks = nodeOrMark.attrs['backlinks'] as IncomingTriple[];
    if (backlinks.length > 1 && nodeOrMark instanceof PNode) {
      const literalNodeId = nodeOrMark.attrs['__rdfaId'] as string | null;
      if (literalNodeId) {
        const [_first, ...rest] = backlinks;

        for (const { predicate, subject } of rest) {
          propElements.push(
            fullLiteralSpan(
              subject.value,
              predicate,
              sayDataFactory.literal(
                (nodeOrMark.attrs['content'] as Option<string>) ??
                  nodeOrMark.textContent,
                languageOrDataType(
                  nodeOrMark.attrs['lang'] as Option<string>,
                  nodeOrMark.attrs['datatype'] as Option<NamedNode>,
                ),
              ),
              literalNodeId,
            ),
          );
        }
      }
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
          'data-say-id': rdfaAttrs.__rdfaId,
          property: contentTriple.predicate,
          datatype: contentTriple.object.language.length
            ? null
            : contentTriple.object.datatype.value,
          lang: contentTriple.object.language,
          resource: null,
        }
      : {
          about: rdfaAttrs.subject,
          'data-say-id': rdfaAttrs.__rdfaId,
          resource: null,
        };
  } else {
    const backlinks = rdfaAttrs.backlinks;
    const datatypeAndLanguage: Record<string, string> = {};
    if (rdfaAttrs.datatype) {
      datatypeAndLanguage['datatype'] = rdfaAttrs.datatype.value;
    }
    if (rdfaAttrs.language) {
      datatypeAndLanguage['lang'] = rdfaAttrs.language;
    }

    if (!backlinks.length) {
      const resultAttrs: Record<string, string | null> = {
        content: rdfaAttrs.content ?? null,
        'data-say-id': rdfaAttrs.__rdfaId,
        'data-literal-node': 'true',
        ...datatypeAndLanguage,
      };

      return resultAttrs;
    }

    return {
      about: backlinks[0].subject.value,
      property: backlinks[0].predicate,
      content: rdfaAttrs.content ?? null,
      'data-literal-node': 'true',
      'data-say-id': rdfaAttrs.__rdfaId,
      ...datatypeAndLanguage,
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
      return [...(child as HTMLElement).children].filter(
        (child) =>
          isElement(child) && !child.dataset['externalTripleContainer'],
      );
    }
  }
  return null;
};
export const findExternalElements = (node: Node) => {
  const contentElement = findRdfaContentElement(node);
  if (!contentElement || !isElement(contentElement)) {
    return null;
  }
  for (const child of contentElement.children) {
    if ((child as HTMLElement).dataset['externalTripleContainer']) {
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
