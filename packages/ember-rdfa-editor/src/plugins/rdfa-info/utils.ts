import { getRdfaId, getSubject, rdfaInfoPluginKey } from './plugin.ts';
import { EditorState, Selection } from 'prosemirror-state';
import { PNode } from '#root/prosemirror-aliases.ts';
import { Mapping } from 'prosemirror-transform';
import type {
  IncomingTriple,
  LinkTriple,
  OutgoingTriple,
} from '#root/core/rdfa-processor.ts';
import {
  LiteralNodeTerm,
  ResourceNodeTerm,
  sayDataFactory,
  type SayTerm,
} from '#root/core/say-data-factory/index.ts';
import { isElement } from '#root/utils/_private/dom-helpers.ts';
import { v4 as uuidv4 } from 'uuid';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import type {
  TransactionMonad,
  TransactionMonadResult,
} from '#root/utils/transaction-utils.ts';
import TransformUtils from '#root/utils/_private/transform-utils.ts';
import type { RemovePropertyArgs } from '#root/commands/rdfa-commands/remove-property.ts';
import { isRdfaAttrs, type RdfaAttrs } from '#root/core/schema.ts';
import { unwrap } from '#root/utils/_private/option.ts';
import MapUtils from '#root/utils/_private/map-utils.ts';

export function getNodeByRdfaId(state: EditorState, rdfaId: string) {
  return rdfaInfoPluginKey.getState(state)?.rdfaIdMapping.get(rdfaId);
}

/**
 * In RDFA, many nodes can define the same subject, find all of those nodes
 * @param state
 * @param subject - Subject URI
 */
export function getNodesBySubject(state: EditorState, subject: string) {
  return rdfaInfoPluginKey.getState(state)?.subjectMapping.get(subject) ?? [];
}

export function getRdfaIds(state: EditorState) {
  const pluginState = rdfaInfoPluginKey.getState(state);
  return pluginState ? [...pluginState.rdfaIdMapping.keys()] : [];
}

export function getSubjects(state: EditorState) {
  const pluginState = rdfaInfoPluginKey.getState(state);
  return pluginState ? [...pluginState.subjectMapping.keys()] : [];
}

function getCorrespondingBacklink(
  state: EditorState,
  subject: string,
  property: OutgoingTriple,
) {
  const { object } = property;
  if (object.termType !== 'LiteralNode' && object.termType !== 'ResourceNode') {
    return;
  }
  const node =
    object.termType === 'LiteralNode'
      ? getNodeByRdfaId(state, object.value)
      : getNodesBySubject(state, object.value)[0];
  if (!node) {
    return;
  }
  const backlinks = node.value.attrs['backlinks'] as IncomingTriple[];
  const correspondingBacklink = backlinks.find(
    (bl) => bl.subject.value === subject && bl.predicate === property.predicate,
  );
  return correspondingBacklink;
}

function getCorrespondingProperty(
  state: EditorState,
  object: string,
  backlink: IncomingTriple,
) {
  const { subject } = backlink;
  const node = getNodesBySubject(state, subject.value)[0];
  if (!node) {
    return;
  }
  const properties = node.value.attrs['properties'] as OutgoingTriple[];
  const correspondingProperty = properties.find(
    (prop) =>
      prop.object.value === object && prop.predicate === backlink.predicate,
  );
  return correspondingProperty;
}

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
      result.push(mark.attrs[attr] as string);
    }
  });
  if (node.attrs[attr]) {
    result.push(node.attrs[attr] as string);
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
        pos,
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
          result.add({
            predicate: backlinks[0].predicate,
            object: sayDataFactory.literalNode(id),
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
          return a.object.value === b.object.value;
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
  return a.predicate === b.predicate && a.subject.value === b.subject.value;
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
      const newBacklink: IncomingTriple = {
        subject: sayDataFactory.resourceNode(resource),
        predicate: property.predicate,
      };
      if (object.termType === 'LiteralNode') {
        const target = getNodeByRdfaId(state, object.value);
        if (target) {
          targets = [target];
        }
      } else {
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

// TODO should we unify this and the command version? The difficulty is that the presence or not of
// `dispatch` allows the command to hold off on some expensive work, which is not possible here.
/**
 * Adapted from `removeProperty` command to return a `TransactionMonad` instead
 */
export function removePropertyFromNode(
  args: RemovePropertyArgs,
): TransactionMonad<boolean> {
  return (state) => {
    const tr = state.tr;

    let resource: string | undefined;
    let resourceNodes: ResolvedPNode[];
    if ('resource' in args) {
      resource = args.resource;
      resourceNodes = getNodesBySubject(state, args.resource);
      if (!resourceNodes?.length) {
        return { initialState: state, transaction: tr, result: false };
      }
    } else {
      resourceNodes = [{ value: args.documentResourceNode, pos: -1 }];
    }

    const properties = getProperties(resourceNodes[0].value);
    let propertyToRemove: OutgoingTriple | undefined;
    let index = -1;
    if ('index' in args) {
      propertyToRemove = properties?.[args.index];
      index = args.index;
    } else {
      index =
        properties?.findIndex((prop) =>
          deepEqualProperty(prop, args.property),
        ) ?? -1;
      propertyToRemove = properties?.[index];
    }
    if (!propertyToRemove || !properties) {
      return { initialState: state, transaction: tr, result: false };
    }

    // First update the properties of all nodes defining the given resource
    const updatedProperties = properties.slice();
    updatedProperties.splice(index, 1);
    resourceNodes.forEach((node) => {
      TransformUtils.setAttribute(
        tr,
        node.pos,
        'properties',
        updatedProperties,
      );
    });

    // Then we remove any backlinks.
    if (isLinkToNode(propertyToRemove)) {
      const { object } = propertyToRemove;
      /**
       * We need two make two cases here
       * - The object of this property is a literal: we update the backlink of the corresponding content node, using its nodeId
       * - The object of this property is a namednode: we update the backlinks of the corresponding resource nodes, using the resource
       */
      let targets: ResolvedPNode[] | undefined;
      if (object.termType === 'LiteralNode') {
        const target = getNodeByRdfaId(state, object.value);
        if (target) {
          targets = [target];
        }
      } else {
        targets = getNodesBySubject(state, object.value);
      }
      targets?.forEach((target) => {
        const backlinks = getBacklinks(target.value);
        if (backlinks) {
          if (!resource) {
            const backlink = backlinks.find(
              (bl) =>
                bl.predicate === propertyToRemove?.predicate &&
                'importedResources' in args &&
                args.importedResources.includes(bl.subject.value),
            );
            resource = backlink?.subject.value;
          }
          const filteredBacklinks = backlinks.filter((backlink) => {
            return !(
              backlink.predicate === propertyToRemove?.predicate &&
              backlink.subject.value === resource
            );
          });
          TransformUtils.setAttribute(
            tr,
            target.pos,
            'backlinks',
            filteredBacklinks,
          );
        }
      });
    }

    return { initialState: state, transaction: tr, result: true };
  };
}
function getRdfaIdsOfObject(state: EditorState, object: SayTerm): string[] {
  let rdfaIds: string[] = [];
  if (object.termType === 'ResourceNode') {
    // if an object refers to a resource, multiple nodes could define that
    // resource, which is why this function returns an array
    rdfaIds = getNodesBySubject(state, object.value).map(
      ({ value }) => value.attrs['__rdfaId'] as string,
    );
  } else if (object.termType === 'LiteralNode') {
    rdfaIds = [object.value];
  }
  // all other termtypes don't refer to nodes
  return rdfaIds;
}
/**
 * For a given outgoing triple, find all nodes which backlink to it.
 * @returns RdfaIds of the found nodes, and the backlink
 */
function followPropToBacklinks(
  state: EditorState,
  subject: string,
  prop: OutgoingTriple,
): { rdfaIds: string[]; backlink: IncomingTriple } | null {
  const correspondingBacklink = getCorrespondingBacklink(state, subject, prop);
  if (!correspondingBacklink) {
    return null;
  }
  const { object } = prop;
  const rdfaIds = getRdfaIdsOfObject(state, object);
  return { rdfaIds, backlink: correspondingBacklink };
}
/**
 * For a given set of resource node attrs
 * (no other attrs make sense to ask this of),
 * find all nodes which backlink to it.
 * @returns a map of each node's rdfaId onto the backlinks that node has to
 * the given attrs
 * */
function getAllBacklinkingNodes(
  state: EditorState,
  attrs: RdfaAttrs & { rdfaNodeType: 'resource' },
) {
  const rslt: Map<string, IncomingTriple[]> = new Map();
  const { properties } = attrs;
  for (const prop of properties) {
    const backlinkingNodes = followPropToBacklinks(state, attrs.subject, prop);
    if (backlinkingNodes) {
      const { rdfaIds, backlink } = backlinkingNodes;
      for (const rdfaId of rdfaIds) {
        MapUtils.setOrPush(rslt, rdfaId, backlink);
      }
    }
  }
  return rslt;
}

export type UpdateSubjectArgs = {
  pos: number;
  targetSubject: string;
  keepBacklinks: boolean;
  keepProperties: boolean;
  keepExternalTriples: boolean;
};

export function updateSubject(
  args: UpdateSubjectArgs,
): TransactionMonad<boolean> {
  return (state) => {
    const {
      pos,
      targetSubject,
      keepExternalTriples,
      keepProperties,
      keepBacklinks,
    } = args;
    const nodeToUpdate = state.doc.nodeAt(pos);

    const doNothing = {
      initialState: state,
      transaction: state.tr,
      result: false,
    };

    if (!nodeToUpdate) {
      return doNothing;
    }
    const { attrs } = nodeToUpdate;
    if (!isRdfaAttrs(attrs) || attrs.rdfaNodeType !== 'resource') {
      return doNothing;
    }

    if (attrs.subject === targetSubject) {
      return doNothing;
    }
    const tr = state.tr;

    // Retrieve (other) nodes with the same subject
    const nodesWithSameOriginalSubject = getNodesBySubject(
      state,
      attrs.subject,
    ).filter((n) => n.value !== nodeToUpdate);

    tr.setNodeAttribute(pos, 'subject', targetSubject);
    if (!keepExternalTriples) {
      tr.setNodeAttribute(pos, 'externalTriples', []);
    }

    // Collection of backlinks which need to be updated (or removed), grouped by the `__rdfaId` of their object node
    const backlinksToUpdateGroupedByObjectRdfaId: Map<
      string,
      IncomingTriple[]
    > = getAllBacklinkingNodes(state, attrs);

    if (keepProperties) {
      // In case the properties of the node need to be kept, we need to update their corresponding backlinks.
      // Two cases:
      // - No other nodes define the same original subject => we can simply remove the old backlinks + add the new backlinks
      // - Other nodes define the same original subject => we need to keep the old backlinks + add the new backlinks
      for (const [
        rdfaId,
        backlinksToUpdate,
      ] of backlinksToUpdateGroupedByObjectRdfaId.entries()) {
        const node = unwrap(getNodeByRdfaId(state, rdfaId));
        const backlinks = node.value.attrs['backlinks'] as IncomingTriple[];
        let backlinksUpdated = [...backlinks];
        if (!nodesWithSameOriginalSubject.length) {
          backlinksUpdated = backlinksUpdated.filter(
            (bl) => !backlinksToUpdate.includes(bl),
          );
        }
        for (const bl of backlinksToUpdate) {
          const newBl = {
            ...bl,
            subject: sayDataFactory.resourceNode(targetSubject),
          };
          backlinksUpdated.push(newBl);
        }
        tr.setNodeAttribute(node.pos, 'backlinks', backlinksUpdated);
      }
    } else {
      // In case the properties of the node do not need to be kept, we might need to remove some backlinks.
      // Two cases:
      // - No other nodes define the same original subject => remove the necessary backlinks
      // - Other nodes define the same original subject => nothing todo, we can keep the backlinks without issues
      tr.setNodeAttribute(pos, 'properties', []);
      if (!nodesWithSameOriginalSubject.length) {
        // Also remove the corresponding backlinks
        for (const [
          rdfaId,
          backlinksToRemove,
        ] of backlinksToUpdateGroupedByObjectRdfaId.entries()) {
          const node = unwrap(getNodeByRdfaId(state, rdfaId));
          const backlinks = node.value.attrs['backlinks'] as IncomingTriple[];
          const backlinksUpdated = backlinks.filter(
            (bl) => !backlinksToRemove.includes(bl),
          );
          tr.setNodeAttribute(node.pos, 'backlinks', backlinksUpdated);
        }
      }
    }
    const { backlinks } = attrs;

    // Collection of properties which need to be updated (or removed), grouped by the `__rdfaId` of their subject node
    const propertiesToUpdateGroupedBySubjectRdfaId: Map<
      string,
      OutgoingTriple[]
    > = new Map();
    for (const bl of backlinks) {
      const { subject } = bl;
      const rdfaIds = getNodesBySubject(state, subject.value).map(
        ({ value }) => value.attrs['__rdfaId'] as string,
      );
      const correspondingProperty = getCorrespondingProperty(
        state,
        attrs.subject,
        bl,
      );
      if (!correspondingProperty) {
        continue;
      }
      for (const rdfaId of rdfaIds) {
        MapUtils.setOrPush(
          propertiesToUpdateGroupedBySubjectRdfaId,
          rdfaId,
          correspondingProperty,
        );
      }
    }
    if (keepBacklinks) {
      // In case the backlinks of the node need to be kept, we need to update their corresponding properties.
      // Two cases:
      // - No other nodes define the same original subject => we can simply remove the old properties + add the new properties
      // - Other nodes define the same original subject => we need to keep the old properties + add the new properties
      for (const [
        rdfaId,
        propertiesToUpdate,
      ] of propertiesToUpdateGroupedBySubjectRdfaId.entries()) {
        const node = unwrap(getNodeByRdfaId(state, rdfaId));
        const properties = node.value.attrs['properties'] as OutgoingTriple[];
        let propertiesUpdated = [...properties];
        if (!nodesWithSameOriginalSubject.length) {
          propertiesUpdated = propertiesUpdated.filter(
            (bl) => !propertiesToUpdate.includes(bl),
          );
        }
        for (const prop of propertiesToUpdate) {
          const newProp = {
            ...prop,
            object: sayDataFactory.resourceNode(targetSubject),
          };
          propertiesUpdated.push(newProp);
        }
        tr.setNodeAttribute(node.pos, 'properties', propertiesUpdated);
      }
    } else {
      // In case the backlinks of the node do not need to be kept, we might need to remove some properties.
      // Two cases:
      // - No other nodes define the same original subject => remove the necessary properties
      // - Other nodes define the same original subject => nothing todo, we can keep the properties without issues
      tr.setNodeAttribute(pos, 'backlinks', []);
      if (!nodesWithSameOriginalSubject.length) {
        for (const [
          rdfaId,
          propertiesToRemove,
        ] of propertiesToUpdateGroupedBySubjectRdfaId.entries()) {
          const node = unwrap(getNodeByRdfaId(state, rdfaId));
          const properties = node.value.attrs['properties'] as OutgoingTriple[];
          const propertiesUpdated = properties.filter(
            (prop) => !propertiesToRemove.includes(prop),
          );
          tr.setNodeAttribute(node.pos, 'properties', propertiesUpdated);
        }
      }
    }

    // We need to check wether there are other nodes that also define the `targetSubject`
    // Two case:
    // - There are no other nodes defining the target subject => nothing to do
    // - There are nodes defining the target subject => merge the backlinks + merge the properties
    const nodesWithSameTargetSubject = getNodesBySubject(state, targetSubject);
    if (nodesWithSameTargetSubject.length) {
      // Note: we need to resolve the nodes again here,
      // as we want to retrieve it's latest version (it could already have been updated in previous computations)
      const nodeWithSameTargetSubject = unwrap(
        tr.doc.nodeAt(nodesWithSameTargetSubject[0].pos),
      );
      const mergedBacklinks = [
        ...(nodeWithSameTargetSubject.attrs['backlinks'] as IncomingTriple[]),
        ...(unwrap(tr.doc.nodeAt(pos)).attrs['backlinks'] as IncomingTriple[]),
      ];
      const mergedProperties = [
        ...(nodeWithSameTargetSubject.attrs['properties'] as OutgoingTriple[]),
        ...(unwrap(tr.doc.nodeAt(pos)).attrs['properties'] as OutgoingTriple[]),
      ];
      tr.setNodeAttribute(pos, 'backlinks', mergedBacklinks);
      tr.setNodeAttribute(pos, 'properties', mergedProperties);
      for (const {
        pos: nodeWithSameTargetSubject_pos,
      } of nodesWithSameTargetSubject) {
        tr.setNodeAttribute(
          nodeWithSameTargetSubject_pos,
          'backlinks',
          mergedBacklinks,
        );
        tr.setNodeAttribute(
          nodeWithSameTargetSubject_pos,
          'properties',
          mergedProperties,
        );
      }
    }
    return {
      initialState: state,
      transaction: tr,
      result: true,
    };
  };
}
