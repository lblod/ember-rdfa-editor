import { EditorState, Selection } from 'prosemirror-state';
import { PNode } from '#root/prosemirror-aliases.ts';
import { Mapping } from 'prosemirror-transform';
import type {
  IncomingTriple,
  LinkTriple,
  OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import {
  languageOrDataType,
  sayDataFactory,
} from '#root/core/say-data-factory/index.ts';
import { isElement } from '#root/utils/_private/dom-helpers.ts';
import { v4 as uuidv4 } from 'uuid';
import type { ResolvedPNode } from './types.ts';
import {
  getNodeByRdfaId,
  getNodesBySubject,
} from '#root/plugins/rdfa-info/index.ts';
import TransformUtils from './transform-utils.ts';
import type {
  TransactionMonad,
  TransactionMonadResult,
} from '../transaction-utils.ts';

export type RdfaAttr =
  | 'vocab'
  | 'typeof'
  | 'prefix'
  | 'property'
  | 'rel'
  | 'rev'
  | 'href'
  | 'about'
  | 'resource'
  | 'content'
  | 'datatype'
  | 'lang'
  | 'xmlns'
  | 'src'
  | 'id'
  | 'role'
  | 'inlist'
  | 'datetime';
/**
 * this is used when reading the full editor document to fetch any prefixes defined above the editor
 * NOTE: it adds the active vocab as a prefix with an empty string as key, which makes it a bit easier to pass down
 * convienently it is also  how the RdfaAttributes class of marawa uses it when calculating rdfa attributes.
 * This is highly reliant on the internals of that class and may stop working at some point.
 */
export function calculateRdfaPrefixes(start: Node): Map<string, string> {
  const nodes: HTMLElement[] = [];
  if (isElement(start)) {
    nodes.push(start);
  }
  let currentNode = start.parentElement;
  while (currentNode !== null) {
    nodes.push(currentNode);
    currentNode = currentNode.parentElement;
  }

  // parse parents top down
  let currentPrefixes: Map<string, string> = new Map<string, string>();
  let vocab = '';
  for (const element of nodes.reverse()) {
    const prefixString: string = element.getAttribute('prefix') || '';
    currentPrefixes = new Map([
      ...currentPrefixes,
      ...parsePrefixString(prefixString),
    ]);
    if (element.hasAttribute('vocab')) {
      vocab = element.getAttribute('vocab') || ''; // TODO: verify if empty vocab really should clear out vocab
    }
  }
  currentPrefixes.set('', vocab);
  return currentPrefixes;
}

/**
 * Parses an RDFa prefix string and returns a map of prefixes to URIs.
 * According to the RDFa spec prefixes must be seperated by exactly one space.
 *
 * Note: borrowed from marawa, but this returns a map instead of an object
 */
export function parsePrefixString(prefixString: string) {
  const parts = prefixString.split(' ');
  const prefixes: Map<string, string> = new Map<string, string>();
  for (let i = 0; i < parts.length; i = i + 2) {
    const key = parts[i].substring(0, parts[i].length - 1);
    prefixes.set(key, parts[i + 1]);
  }
  return prefixes;
}

export function getRdfaAttribute(node: PNode, attr: RdfaAttr): string[] {
  const result: string[] = [];
  if (!node.marks) {
    return [];
  }
  node.marks.forEach((mark) => {
    if (mark.attrs[attr]) {
      result.push(mark.attrs[attr]);
    }
  });
  if (node.attrs[attr]) {
    result.push(node.attrs[attr]);
  }
  return result;
}

export function mapPositionFrom(
  pos: number,
  mapping: Mapping,
  from: number,
  assoc?: number,
) {
  let curPos = pos;
  for (let i = from ?? 0; i < mapping.maps.length; i++) {
    curPos = mapping.maps[i].map(curPos, assoc);
  }
  return curPos;
}

export function findNodeByRdfaId(
  doc: PNode,
  rdfaId: string,
): ResolvedPNode | undefined {
  let result: ResolvedPNode | undefined;
  doc.descendants((node, pos) => {
    if (result) return false;
    if (node.attrs['__rdfaId'] === rdfaId) {
      result = {
        pos: pos,
        value: node,
      };
      return false;
    }
    return true;
  });
  return result;
}

export function findNodesBySubject(
  doc: PNode,
  subject: string,
): ResolvedPNode[] {
  const result: ResolvedPNode[] = [];
  doc.descendants((node, pos) => {
    if (node.attrs['subject'] === subject) {
      result.push({ pos, value: node });
    }
    return true;
  });
  return result;
}

export function getRdfaId(node: PNode): string | undefined {
  return node.attrs['__rdfaId'] as string | undefined;
}

export function getSubject(node: PNode): string | undefined {
  return (node.attrs['subject'] ??
    node.attrs['about'] ??
    node.attrs['resource']) as string | undefined;
}

export function getProperties(node: PNode): OutgoingTriple[] | undefined {
  return node.attrs['properties'] as OutgoingTriple[] | undefined;
}

export function getBacklinks(node: PNode): IncomingTriple[] | undefined {
  return node.attrs['backlinks'] as IncomingTriple[] | undefined;
}

export function addProperty(
  properties: OutgoingTriple[],
  property: OutgoingTriple,
) {
  // TODO: probably better to use a set of some kind for this data
  // Do not add the property if it is already present
  if (properties.some((prop) => deepEqualProperty(prop, property))) {
    return properties;
  } else {
    return [...properties, property];
  }
}

export function addBacklink(
  backlinks: IncomingTriple[],
  backlink: IncomingTriple,
) {
  // TODO: probably better to use a set of some kind for this data
  // Do not add the backlink if it is already present
  if (backlinks.some((bl) => deepEqualBacklink(bl, backlink))) {
    return backlinks;
  } else {
    return [...backlinks, backlink];
  }
}

/**
 * Calculates a set of subject attributes present in the provided node and its children
 */
export function getSubjects(node: PNode): Set<string> {
  const result = new Set<string>();
  const subject = getSubject(node);
  if (subject) {
    result.add(subject);
  }
  node.descendants((child) => {
    const subject = getSubject(child);
    if (subject) {
      result.add(subject);
    }
    return true;
  });
  return result;
}

export function findRdfaIdsInSelection(selection: Selection) {
  const result = new Set<string>();
  const range = selection.$from.blockRange(selection.$to);
  if (!range) return result;
  // Could use selection.content() here, but this uses doc.slice() internally but with the 'include
  // parents' flag true, which then includes too much of the document
  selection.$from.doc
    .slice(selection.from, selection.to, false)
    .content.descendants((child) => {
      const id = getRdfaId(child);
      if (id) {
        result.add(id);
      }
      return true;
    });
  return result;
}

/**
 * Get the first external property of nodes which are children of the given node, without recursing
 * into resource nodes
 */
export function getRdfaChildren(node: PNode) {
  const result = new Set<LinkTriple>();
  node.descendants((child) => {
    const id = getRdfaId(child);
    if (id) {
      const backlinks = getBacklinks(child);
      const subject = getSubject(child);
      if (backlinks?.[0]) {
        if (subject) {
          result.add({
            predicate: backlinks[0].predicate,
            object: sayDataFactory.resourceNode(subject),
          });
        } else {
          const incomingTriple = backlinks[0];
          if (incomingTriple.subject.termType !== 'LiteralNode') {
            throw new Error(
              'Unexpected type of incoming triple of a literal node',
            );
          }
          result.add({
            predicate: backlinks[0].predicate,
            object: sayDataFactory.literalNode(
              id,
              languageOrDataType(
                incomingTriple.subject.language,
                incomingTriple.subject.datatype,
              ),
            ),
          });
        }
      }
      // We don't want to recurse, so stop descending
      return false;
    }
    return true;
  });
  return result;
}

/**
 * Generate a new URI using the passed base (must include terminating / or #, etc).
 * Also returns an rdfaId for convenience
 */
export function generateNewUri(uriBase: string) {
  const __rdfaId = uuidv4();
  return {
    __rdfaId,
    resource: `${uriBase}${__rdfaId}`,
  };
}

export function deepEqualProperty(a: OutgoingTriple, b: OutgoingTriple) {
  if (a.predicate === b.predicate) {
    switch (a.object.termType) {
      case 'NamedNode': {
        if (b.object.termType === 'NamedNode') {
          return a.object.value === b.object.value;
        }
        break;
      }
      case 'BlankNode': {
        if (b.object.termType === 'BlankNode') {
          return a.object.value === b.object.value;
        }
        break;
      }
      case 'ResourceNode': {
        if (b.object.termType === 'ResourceNode') {
          return a.object.value === b.object.value;
        }
        break;
      }
      case 'Literal': {
        if (b.object.termType === 'Literal') {
          return (
            a.object.value === b.object.value &&
            a.object.datatype.value === b.object.datatype.value &&
            a.object.language === b.object.language
          );
        }
        break;
      }
      case 'LiteralNode': {
        if (b.object.termType === 'LiteralNode') {
          return (
            a.object.value === b.object.value &&
            a.object.datatype.value === b.object.datatype.value &&
            a.object.language === b.object.language
          );
        }
        break;
      }
      case 'ContentLiteral': {
        if (b.object.termType === 'ContentLiteral') {
          return (
            a.object.datatype.value === b.object.datatype.value &&
            a.object.language === b.object.language
          );
        }
        break;
      }
    }
  }
  return false;
}

export function deepEqualBacklink(a: IncomingTriple, b: IncomingTriple) {
  if (a.predicate === b.predicate) {
    switch (a.subject.termType) {
      case 'ResourceNode': {
        if (b.subject.termType === 'ResourceNode') {
          return a.subject.value === b.subject.value;
        }
        break;
      }
      case 'LiteralNode': {
        if (b.subject.termType === 'LiteralNode') {
          return (
            a.subject.value === b.subject.value &&
            a.subject.datatype.value === b.subject.datatype.value &&
            a.subject.language === b.subject.language
          );
        }
        break;
      }
    }
  }
  return false;
}

export function isLinkToNode(triple: OutgoingTriple): triple is LinkTriple {
  return (
    triple.object.termType === 'LiteralNode' ||
    triple.object.termType === 'ResourceNode'
  );
}

export type AddPropertyToNodeArgs = {
  /** The resource to which to add a property */
  resource: string;
  /** Property to add */
  property: OutgoingTriple;
};
export function addPropertyToNode({
  resource,
  property,
}: AddPropertyToNodeArgs): TransactionMonad<boolean> {
  return function (state: EditorState): TransactionMonadResult<boolean> {
    const tr = state.tr;
    const resourceNodes = getNodesBySubject(state, resource);
    if (!resourceNodes?.length) {
      return { initialState: state, transaction: tr, result: false };
    }

    const properties = getProperties(resourceNodes[0].value);
    const updatedProperties = addProperty(properties ?? [], property);

    // Update the properties of each node that defines the given resource
    resourceNodes.forEach((node) => {
      TransformUtils.setAttribute(
        tr,
        node.pos,
        'properties',
        updatedProperties,
      );
    });

    if (isLinkToNode(property)) {
      const { object } = property;
      let targets: ResolvedPNode[] | undefined;
      /**
       * We need two make two cases here
       * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
       * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
       */
      let newBacklink: IncomingTriple;
      if (object.termType === 'LiteralNode') {
        newBacklink = {
          subject: sayDataFactory.literalNode(
            resource,
            languageOrDataType(object.language, object.datatype),
          ),
          predicate: property.predicate,
        };
        const target = getNodeByRdfaId(state, object.value);
        if (target) {
          targets = [target];
        }
      } else {
        newBacklink = {
          subject: sayDataFactory.resourceNode(resource),
          predicate: property.predicate,
        };
        targets = getNodesBySubject(state, object.value);
      }
      targets?.forEach((target) => {
        const backlinks = target.value.attrs['backlinks'] as
          | IncomingTriple[]
          | undefined;
        const newBacklinks = addBacklink(backlinks ?? [], newBacklink);
        TransformUtils.setAttribute(tr, target.pos, 'backlinks', newBacklinks);
      });
    }
    return { initialState: state, transaction: tr, result: true };
  };
}
