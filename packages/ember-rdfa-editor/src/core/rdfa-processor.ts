import { v4 as uuidv4 } from 'uuid';
import {
  isElement,
  isTextNode,
  tagName,
} from '#root/utils/_private/dom-helpers.ts';
import {
  type default as Datastore,
  EditorStore,
} from '#root/utils/_private/datastore/datastore.ts';
import type { NamedNode, Quad } from '@rdfjs/types';
import {
  SayLiteral,
  SayNamedNode,
  SayBlankNode,
  ResourceNodeTerm,
  LiteralNodeTerm,
  ContentLiteralTerm,
  sayDataFactory,
  languageOrDataType,
} from './say-data-factory/index.ts';
import type { SubAndContentPred } from '#root/utils/_private/datastore/node-map.ts';

export type SayTermType =
  | 'NamedNode'
  | 'Literal'
  | 'LiteralNode'
  | 'ResourceNode'
  | 'ContentLiteral'
  | 'BlankNode';

export interface LiteralTriple {
  predicate: string;
  object: SayLiteral;
}
export interface NamedNodeTriple {
  predicate: string;
  object: SayNamedNode;
}
export interface BlankNodeTriple {
  predicate: string;
  object: SayBlankNode;
}
export interface ResourceNodeTriple {
  predicate: string;
  object: ResourceNodeTerm;
}
export interface LiteralNodeTriple {
  predicate: string;
  object: LiteralNodeTerm;
}
export type ContentTriple = {
  predicate: string;
  object: ContentLiteralTerm;
};

export type PlainTriple = LiteralTriple | NamedNodeTriple | BlankNodeTriple;
export type LinkTriple = ResourceNodeTriple | LiteralNodeTriple;
export type OutgoingTriple =
  | LiteralTriple
  | NamedNodeTriple
  | BlankNodeTriple
  | ResourceNodeTriple
  | LiteralNodeTriple
  | ContentTriple;

export type IncomingTriple = {
  subject: ResourceNodeTerm;
  predicate: string;
};

export type FullTriple = {
  subject: SayNamedNode;
  predicate: string;
  object: SayNamedNode | SayLiteral;
};

export function isLinkTriple(triple: OutgoingTriple): triple is LinkTriple {
  return ['ResourceNode', 'LiteralNode'].includes(triple.object.termType);
}

/**
 * Function responsible for computing the properties and backlinks of a given document.
 * The properties and backlinks are stored in data-attributes in the nodes themselves.
 */
export function preprocessRDFa(dom: Node, pathFromRoot?: Node[]) {
  // parse the html
  const datastore = EditorStore.fromParse<Node>({
    parseRoot: true,
    root: dom,
    tag: tagName,
    baseIRI: 'http://example.org',
    attributes(node: Node): Record<string, string> {
      if (isElement(node)) {
        const result: Record<string, string> = {};
        for (const attr of node.attributes) {
          result[attr.name] = attr.value;
        }
        return result;
      }
      return {};
    },
    isText: isTextNode,
    children(node: Node): Iterable<Node> {
      return node.childNodes;
    },
    pathFromDomRoot: pathFromRoot,
    textContent(node: Node): string {
      return node.textContent || '';
    },
  });

  const seenExternalSubjects = new Set<string>();
  // every resource node
  for (const [node, entry] of datastore.getResourceNodeMap().entries()) {
    const properties: OutgoingTriple[] = [];
    // get all quads that have our subject
    const outgoingQuads = datastore.match(entry.subject).asQuadResultSet();
    const seenLinks = new Set<string>();
    for (const quad of outgoingQuads) {
      quadToProperties(datastore, quad, entry).forEach((prop) => {
        if (prop.object.termType === 'LiteralNode') {
          if (!seenLinks.has(prop.object.value)) {
            seenLinks.add(prop.object.value);
            properties.push(prop);
          }
          // we'll handle this case separately below
        } else {
          properties.push(prop);
        }
      });
    }

    const incomingProps: IncomingTriple[] = [];
    const incomingQuads = datastore.match(null, null, entry.subject);
    for (const quad of incomingQuads.asQuadResultSet()) {
      incomingProps.push(quadToBacklink(quad));
    }

    // write info to node
    // write info to node
    (node as HTMLElement).dataset['outgoingProps'] = JSON.stringify(properties);
    (node as HTMLElement).dataset['incomingProps'] =
      JSON.stringify(incomingProps);
    (node as HTMLElement).dataset['rdfaNodeType'] = 'resource';
    (node as HTMLElement).dataset['subject'] = entry.subject.value;
    // due to the post-processing of the parsed triples, we can be sure that
    // a loose triple gets interpreted as a resource node at this stage
    // this does not mean it becomes a prosemirror resource node:
    // the definition of "resource" node at the parsing level is actually
    // slightly different from the one at the prosemirror-schema level, and
    // should probably get a new name. Here, resource node simply means: any
    // html element which defines a subject of a triple.
    if (
      node.parentElement?.dataset['externalTripleContainer'] &&
      !seenExternalSubjects.has(entry.subject.value)
    ) {
      seenExternalSubjects.add(entry.subject.value);
      const ownerElement = node.parentElement?.parentElement?.parentElement;
      const newTriples = properties
        // if the subject of a backlink to a literal node
        // doesn't belong to a resource node,
        // it will get interpreted both as a normal backlink (which is what we
        // want) _and_ as an external triple with the target Id as a string
        // value, which is what we don't want, so we filter that case here
        .filter(
          (prop) =>
            ownerElement && prop.object.value !== ownerElement.dataset['sayId'],
        )
        .map((prop) => ({
          subject: { termType: 'NamedNode', value: entry.subject.value },
          ...prop,
        }));

      if (ownerElement) {
        const previousTriples = ownerElement.dataset['externalTriples'];
        if (previousTriples) {
          const prev = JSON.parse(previousTriples) as unknown[];

          ownerElement.dataset['externalTriples'] = JSON.stringify(
            prev.concat(newTriples),
          );
        } else {
          ownerElement.dataset['externalTriples'] = JSON.stringify(newTriples);
        }
      } else {
        // shouldn't happen, we only set the data-external-triple-container attr on
        // nodes within an rdfa-container
        console.warn(
          'Found external triples in an element without a parent resource node to attach them to. Possible data loss',
        );
      }
    }
  }
  // each content node
  for (const [node, object] of datastore.getContentNodeMap().entries()) {
    const { subject, predicate } = object;

    const incomingProp: IncomingTriple = {
      subject,
      predicate: predicate.value,
    };
    const extraBacklinks: IncomingTriple[] = [];
    if (isElement(node)) {
      const firstChild = node.firstElementChild;
      if (
        firstChild &&
        isElement(firstChild) &&
        firstChild.dataset['rdfaContainer'] === 'true'
      ) {
        for (const child of firstChild.children as Iterable<HTMLElement>) {
          if (
            child.dataset['literalNode'] === 'true' &&
            child.dataset['sayId']
          ) {
            const backlink = datastore.getContentNodeMap().get(child);
            if (backlink) {
              extraBacklinks.push({
                subject: backlink.subject,
                predicate: backlink.predicate.value,
              });
            }
          }
        }
      }
    }

    // write info to node
    (node as HTMLElement).dataset['incomingProps'] = JSON.stringify([
      incomingProp,
      ...extraBacklinks,
    ]);
    (node as HTMLElement).dataset['rdfaNodeType'] = 'literal';
  }
}

function quadToProperties(
  datastore: Datastore<Node>,
  quad: Quad,
  entry: SubAndContentPred,
): OutgoingTriple[] {
  const result: OutgoingTriple[] = [];
  // check if quad refers to a contentNode
  if (quad.object.termType === 'Literal') {
    const contentNodes = datastore.getContentNodeMap().getValues({
      subject: sayDataFactory.resourceNode(quad.subject.value),
      predicate: quad.predicate as NamedNode<string>,
      object: quad.object,
    });
    if (contentNodes) {
      for (const contentNode of contentNodes) {
        const contentId = ensureId(contentNode as HTMLElement);
        if (quad.object.termType !== 'Literal') {
          throw new Error(
            'unexpected quad object type for quad referring to literal node',
          );
        }
        result.push({
          predicate: quad.predicate.value,
          object: sayDataFactory.literalNode(contentId),
        });
      }
      return result;
    } else {
      const { contentDatatype, contentLanguage, contentPredicate } = entry;
      if (
        contentPredicate &&
        quad.predicate.equals(contentPredicate) &&
        (!contentDatatype || contentDatatype?.equals(quad.object.datatype)) &&
        (!contentLanguage ||
          contentLanguage.toLowerCase() === quad.object.language.toLowerCase())
      ) {
        return [
          {
            predicate: quad.predicate.value,
            object: sayDataFactory.contentLiteral(
              languageOrDataType(contentLanguage, contentDatatype),
            ),
          },
        ];
      }
      return [
        {
          predicate: quad.predicate.value,
          object: sayDataFactory.literal(
            quad.object.value,
            languageOrDataType(quad.object.language, quad.object.datatype),
          ),
        },
      ];
    }
  } else {
    // check if this quad refers to a resourceNode
    const { object } = quad;
    if (object.termType === 'BlankNode' || object.termType === 'NamedNode') {
      const resourceNode = datastore
        .getResourceNodeMap()
        .getFirstValue({ subject: object });
      if (resourceNode) {
        return [
          {
            predicate: quad.predicate.value,
            object: sayDataFactory.resourceNode(object.value),
          },
        ];
      } else {
        // this is just to make typescript happy
        if (object.termType === 'BlankNode') {
          return [
            {
              predicate: quad.predicate.value,
              object: sayDataFactory.blankNode(quad.object.value),
            },
          ];
        } else {
          return [
            {
              predicate: quad.predicate.value,
              object: sayDataFactory.namedNode(object.value),
            },
          ];
        }
      }
    }
    // neither a content nor resource node, so just a plain attribute
    // termtype === 'Variable', which we don't support.
    return [];
  }
}

function quadToBacklink(quad: Quad): IncomingTriple {
  // check if theres a resource node for the subject
  return {
    subject: sayDataFactory.resourceNode(quad.subject.value),
    predicate: quad.predicate.value,
  };
}

function ensureId(element: HTMLElement): string {
  const rdfaId = element.dataset['sayId'] || uuidv4();
  element.dataset['sayId'] = rdfaId;
  return rdfaId;
}
