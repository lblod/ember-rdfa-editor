import { v4 as uuidv4 } from 'uuid';
import { isElement } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import { Mapping, PNode, Selection } from '@lblod/ember-rdfa-editor';
import type { ResolvedPNode } from './types';
import type {
  IncomingTriple,
  LinkTriple,
  OutgoingTriple,
} from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import {
  languageOrDataType,
  sayDataFactory,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';

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

export function findNodesByResource(
  doc: PNode,
  resource: string,
): ResolvedPNode[] {
  const result: ResolvedPNode[] = [];
  doc.descendants((node, pos) => {
    if (node.attrs['resource'] === resource) {
      result.push({ pos, value: node });
    }
    return true;
  });
  return result;
}

export function getRdfaId(node: PNode): string | undefined {
  return node.attrs['__rdfaId'] as string | undefined;
}

export function getResource(node: PNode): string | undefined {
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

/**
 * Calculates a set of resource attributes present in the provided node and its children
 */
export function getResources(node: PNode): Set<string> {
  const result = new Set<string>();
  const resource = getResource(node);
  if (resource) {
    result.add(resource);
  }
  node.descendants((child) => {
    const resource = getResource(child);
    if (resource) {
      result.add(resource);
    }
    return true;
  });
  return result;
}

export function findRdfaIdsInSelection(selection: Selection) {
  const result = new Set<string>();
  const range = selection.$from.blockRange(selection.$to);
  if (!range) return result;
  selection.content().content.descendants((child) => {
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
      const resource = getResource(child);
      if (backlinks?.[0]) {
        if (resource) {
          result.add({
            predicate: backlinks[0].predicate,
            object: sayDataFactory.resourceNode(resource),
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
  if (a.object.termType === b.object.termType && a.predicate === b.predicate) {
    return Object.keys(a.object).every(
      (key: keyof typeof a.object) => a.object[key] === b.object[key],
    );
  }
  return false;
}

export function isLinkToNode(triple: OutgoingTriple): triple is LinkTriple {
  return (
    triple.object.termType === 'LiteralNode' ||
    triple.object.termType === 'ResourceNode'
  );
}
