import { isElement } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import { Mapping, PNode } from '@lblod/ember-rdfa-editor';
import { ResolvedPNode } from './types';
import { Backlink, Property } from '@lblod/ember-rdfa-editor/core/say-parser';

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
  | 'datetime'
  | '__rdfaId';
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
    if (node.attrs.__rdfaId === rdfaId) {
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
    if (node.attrs.resource === resource) {
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
  return node.attrs.resource as string | undefined;
}

export function getProperties(node: PNode): Property[] | undefined {
  return node.attrs.properties as Property[] | undefined;
}

export function getBacklinks(node: PNode): Backlink[] | undefined {
  return node.attrs.backlinks as Backlink[] | undefined;
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
