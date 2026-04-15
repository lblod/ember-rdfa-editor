import { v4 as uuidv4 } from 'uuid';
import { Mark, type Attrs, type DOMOutputSpec } from 'prosemirror-model';
import { PNode } from '#root/prosemirror-aliases.ts';
import { isSome, unwrap, type Option } from '../utils/_private/option.ts';
import type {
  ContentTriple,
  FullTriple,
  IncomingLiteralTriple,
  IncomingTriple,
  OutgoingTriple,
} from './rdfa-processor.ts';
import { isElement } from '#root/utils/_private/dom-helpers.ts';
import { IMPORTED_RESOURCES_ATTR } from '#root/plugins/imported-resources/index.ts';
import { getSubjectsFromBacklinksOfRelationship } from '#root/utils/rdfa-utils.ts';
import {
  languageOrDataType,
  sayDataFactory,
  SayNamedNode,
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
import {
  rdfaNodeTypes,
  type RdfaAttrs,
  type RdfaNodeType,
} from '#root/core/rdfa-types.ts';
import {
  findNodeByRdfaId,
  updateSubject,
} from '#root/plugins/rdfa-info/utils.ts';
import type { EditorState } from 'prosemirror-state';

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
  subject: {
    default: null,
    editable: true,
    editHandler: (pos: number, value: string) =>
      updateSubject({
        pos,
        targetSubject: value,
        keepBacklinks: true,
        keepExternalTriples: true,
        keepProperties: true,
      }),
  },
  content: { default: null },
  isPointer: { default: null, validate: 'boolean|undefined|null' },
  pointed: { default: null },
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
  let rdfaNodeType = node.dataset['rdfaNodeType'] as RdfaNodeType | undefined;
  if (!rdfaNodeType && node.dataset['literalNode'] === 'true') {
    rdfaNodeType = 'literal';
  }
  if (!rdfaNodeType || !rdfaNodeTypes.includes(rdfaNodeType)) {
    return false;
  }
  const __rdfaId = node.dataset['sayId'] ?? uuidv4();
  const pointed = node.dataset['pointed'];
  let backlinks: IncomingLiteralTriple[] = [];
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
    let transformedDatatype: SayNamedNode | null = null;
    let language = node.getAttribute('lang') ?? null;
    if (datatype) {
      transformedDatatype = sayDataFactory.namedNode(datatype);
    }
    if (backlinks.length === 0) {
      // No RDFa backlink, but this pointer might have a 'data backlink' waiting for something to be
      // pointed to
      const pointerBl = node.dataset['pointerBacklink'];
      const pointerPred = node.dataset['pointerPredicate'];
      if (pointerBl && pointerPred) {
        backlinks = [
          {
            subject: sayDataFactory.resourceNode(pointerBl),
            predicate: pointerPred,
          },
        ];
      }
    } else {
      if (!transformedDatatype && backlinks[0]?.datatype) {
        transformedDatatype = sayDataFactory.namedNode(backlinks[0]?.datatype);
      }
      if (!language && backlinks[0]?.language) {
        language = backlinks[0].language;
      }
    }

    return {
      rdfaNodeType: 'literal',
      content: node.getAttribute('content'),
      datatype: transformedDatatype,
      language,
      __rdfaId,
      backlinks,
      externalTriples,
      pointed,
      isPointer: node.dataset['isPointer'] === 'true',
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
    if (node.dataset['pointerProperties']) {
      // This resource has some pointer node properties that will only be represented in the RDFa if
      // the pointer actually points somewhere
      const pointerProps = (
        JSON.parse(
          node.dataset['pointerProperties'],
          jsonToTerm,
        ) as OutgoingTriple[]
      ).filter((pointerProp) => {
        const matchingPred = properties.filter(
          (prop) => prop.predicate === pointerProp.predicate,
        );
        return (
          !matchingPred ||
          matchingPred.every((mp) => !pointerProp.object.equals(mp.object))
        );
      });
      properties = [...properties, ...pointerProps];
    }

    return {
      rdfaNodeType: 'resource',
      subject,
      __rdfaId,
      backlinks,
      externalTriples,
      properties,
      pointed,
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

export function renderInvisibleRdfa(
  { renderable, rdfaContainerTag, rdfaContainerAttrs }: RdfaRenderInvisibleArgs,
  state?: EditorState,
): DOMOutputSpec {
  const propElements: DOMOutputSpec[] = [];
  const properties = renderable.attrs['properties'] as OutgoingTriple[];
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
        if (!isSome(renderable.attrs['subject'])) {
          console.warn(
            'Trying to render a BlankNode with no subject, ignoring',
            renderable.attrs,
          );
          break;
        }
        const subject: string = unwrap(renderable.attrs['subject'] as string);
        propElements.push(namedNodeSpan(subject, predicate, object.value));
        break;
      }
      case 'ResourceNode':
      // eslint-disable-next-line no-fallthrough
      case 'LiteralNode': {
        const importedResources = renderable.attrs[IMPORTED_RESOURCES_ATTR] as
          | string[]
          | undefined;
        if (importedResources && 'nodeSize' in renderable) {
          const subjects = getSubjectsFromBacklinksOfRelationship(
            renderable,
            importedResources,
            predicate,
            object,
          );
          if (object.termType === 'ResourceNode') {
            subjects.forEach((subject) => {
              propElements.push(
                namedNodeSpan(subject, predicate, object.value),
              );
            });
          } else {
            // We need an invisible RDFa node which defines the subject to ensure that there is
            // somewhere to store outgoingProps in a data attribute
            subjects.forEach((subject) => {
              propElements.push([
                'span',
                {
                  about: subject,
                },
              ]);
            });
          }
        }
        break;
      }
      case 'Literal': {
        propElements.push(literalSpan(predicate, object));
        break;
      }
    }
  }
  const externalTriples = renderable.attrs['externalTriples'] as FullTriple[];
  if (externalTriples.length) {
    const externalElements: DOMOutputSpec[] = [];
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
  let pointedAttrs: Attrs | undefined = renderable.attrs;
  if (renderable.attrs['pointed'] && state) {
    // When serializing, follow the references back to the original pointer node
    while (pointedAttrs?.['pointed']) {
      pointedAttrs = findNodeByRdfaId(
        state.doc,
        pointedAttrs['pointed'] as string,
      )?.value.attrs;
    }
  }
  const backlinks = renderable.attrs['backlinks'] as IncomingTriple[];
  if (renderable.attrs['rdfaNodeType'] === 'resource') {
    // Add RDFa elements for each regular backlink
    for (const { predicate, subject } of backlinks) {
      propElements.push(incomingTripleSpan(subject.value, predicate));
    }
    if (pointedAttrs) {
      // pointedAttrs is only non-null when serializing and we have a 'pointed' value
      const pointerBacklink = (
        pointedAttrs['backlinks'] as RdfaAttrs['backlinks']
      )[0];
      if (pointerBacklink) {
        // Add RDFa for the completed relationship
        propElements.push(
          incomingTripleSpan(
            pointerBacklink.subject.value,
            pointerBacklink.predicate,
          ),
        );
      }
    }
  } else if (renderable.attrs['rdfaNodeType'] === 'literal') {
    if (backlinks.length > 1 && renderable instanceof PNode) {
      const literalNodeId = renderable.attrs['__rdfaId'] as string | null;
      if (literalNodeId) {
        const [_first, ...rest] = backlinks;

        for (const { predicate, subject } of rest) {
          propElements.push(
            fullLiteralSpan(
              subject.value,
              predicate,
              sayDataFactory.literal(
                (renderable.attrs['content'] as Option<string>) ??
                  renderable.textContent,
                languageOrDataType(
                  renderable.attrs['lang'] as Option<string>,
                  renderable.attrs['datatype'] as Option<NamedNode>,
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
    rdfaContainerTag,
    {
      style: 'display: none',
      class: 'say-hidden',
      'data-rdfa-container': true,
      ...rdfaContainerAttrs,
    },
    ...propElements,
  ];
}

export function renderRdfaAttrs(
  rdfaAttrs: RdfaAttrs,
  state?: EditorState,
): Record<string, string | null> {
  if (rdfaAttrs.rdfaNodeType === 'resource') {
    const contentTriple = rdfaAttrs.properties.find(
      (prop) => prop.object.termType === 'ContentLiteral',
    ) as ContentTriple | undefined;
    let baseAttrs: Record<string, string | null> = {
      about: rdfaAttrs.subject,
      resource: null,
      'data-say-id': rdfaAttrs.__rdfaId,
      'data-pointed': rdfaAttrs.pointed ?? null,
    };
    const pointerProps = rdfaAttrs['properties'].filter(
      (prop) => prop.object.termType === 'LiteralNode',
    );
    if (pointerProps.length > 0) {
      baseAttrs = {
        ...baseAttrs,
        'data-pointer-properties': JSON.stringify(pointerProps),
      };
    }

    return contentTriple
      ? {
          property: contentTriple.predicate,
          datatype: contentTriple.object.language.length
            ? null
            : contentTriple.object.datatype.value,
          lang: contentTriple.object.language,
          ...baseAttrs,
        }
      : baseAttrs;
  } else {
    const backlinks = rdfaAttrs.backlinks;
    if (backlinks.length > 1) {
      console.error(
        'More than one backlink found for node ',
        rdfaAttrs.__rdfaId,
        'only the first will be used',
        backlinks,
      );
    }
    const backlink = backlinks[0];
    const datatypeAndLanguage: Record<string, string> = {};
    if (rdfaAttrs.datatype) {
      datatypeAndLanguage['datatype'] = rdfaAttrs.datatype.value;
    }
    if (rdfaAttrs.language) {
      datatypeAndLanguage['lang'] = rdfaAttrs.language;
    }
    const baseAttrs: Record<string, string | null> = {
      content: rdfaAttrs.content ?? null,
      'data-say-id': rdfaAttrs.__rdfaId,
      'data-literal-node': 'true',
      'data-is-pointer': rdfaAttrs.isPointer ? 'true' : 'false',
      'data-pointed': rdfaAttrs.pointed ?? null,
      ...datatypeAndLanguage,
    };

    // Handle potentially complete chain of pointers
    let pointedAttrs: Attrs | undefined = rdfaAttrs;
    if (rdfaAttrs['pointed'] && state) {
      // When serializing, follow the references back to the original pointer node
      while (pointedAttrs?.['pointed']) {
        pointedAttrs = findNodeByRdfaId(
          state.doc,
          pointedAttrs['pointed'] as string,
        )?.value.attrs;
      }
    }
    const pointerBacklink =
      pointedAttrs && (pointedAttrs['backlinks'] as RdfaAttrs['backlinks'])[0];
    if (!backlink && !pointerBacklink) {
      return baseAttrs;
    }

    if (
      datatypeAndLanguage['datatype'] ||
      datatypeAndLanguage['lang'] ||
      !rdfaAttrs.isPointer
    ) {
      // This pointer node points to it's own content as a literal.
      // While a literal node need not have a datatype or language, if it does, it has to point at
      // it's contents.
      const bl = backlink || pointerBacklink;
      return {
        about: bl.subject.value,
        property: bl.predicate,
        ...baseAttrs,
      };
    } else {
      return {
        // Only store direct pointers as data attributes
        'data-pointer-backlink': backlink.subject.value,
        'data-pointer-predicate': backlink.predicate,
        'data-is-pointer': 'true',
        ...baseAttrs,
      };
    }
  }
}

export interface RenderContentArgs {
  tag: keyof HTMLElementTagNameMap;
  extraAttrs?: Record<string, unknown>;
  content: DOMOutputSpec;
}
export type RdfaRenderInvisibleArgs = {
  renderable: PNode | Mark;
  rdfaContainerTag: string;
  rdfaContainerAttrs?: Record<string, unknown>;
};
export type RdfaRenderArgs = Omit<
  RdfaRenderInvisibleArgs,
  'rdfaContainerTag'
> & {
  tag: string;
  attrs?: Record<string, unknown>;
  rdfaContainerTag?: string;
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
export function renderRdfaAware(
  {
    renderable,
    tag,
    attrs = {},
    rdfaContainerTag = determineChildTag(renderable),
    rdfaContainerAttrs,
    contentContainerTag = determineChildTag(renderable),
    contentContainerAttrs = {},
    ...rest
  }: RdfaRenderArgs,
  state?: EditorState,
): DOMOutputSpec {
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
    { ...clone, ...renderRdfaAttrs(renderable.attrs as RdfaAttrs, state) },
    renderInvisibleRdfa(
      { renderable, rdfaContainerTag, rdfaContainerAttrs },
      state,
    ),
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
