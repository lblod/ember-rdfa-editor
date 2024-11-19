import { v4 as uuidv4 } from 'uuid';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import {
  type default as Datastore,
  EditorStore,
  type SubAndContentPred,
} from '@lblod/ember-rdfa-editor/utils/_private/datastore/datastore';
import type { Quad } from '@rdfjs/types';
import type { SayLiteral } from './say-data-factory';
import type { SayNamedNode } from './say-data-factory';
import {
  SayBlankNode,
  ResourceNodeTerm,
  LiteralNodeTerm,
  ContentLiteralTerm,
  sayDataFactory,
  languageOrDataType,
} from './say-data-factory';

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

export type IncomingResourceNodeTriple = {
  subject: ResourceNodeTerm;
  predicate: string;
};
export type IncomingLiteralNodeTriple = {
  subject: LiteralNodeTerm;
  predicate: string;
};
export type IncomingTriple =
  | IncomingLiteralNodeTriple
  | IncomingResourceNodeTriple;
export type FullTriple = {
  subject: SayNamedNode;
  predicate: string;
  object: SayNamedNode | SayLiteral;
};
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
    if (node.parentElement?.dataset['externalTripleContainer']) {
      const ownerElement = node.parentElement?.parentElement?.parentElement;
      if (ownerElement) {
        ownerElement.dataset['externalTriples'] = JSON.stringify(
          properties.map((prop) => ({
            subject: { termType: 'NamedNode', value: entry.subject.value },
            ...prop,
          })),
        );
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

    const incomingProp = {
      subject,
      predicate,
    };
    // write info to node
    // write info to node
    (node as HTMLElement).dataset['incomingProps'] = JSON.stringify([
      incomingProp,
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
      subject: sayDataFactory.literalNode(
        quad.subject.value,
        languageOrDataType(quad.object.language, quad.object.datatype),
      ),
      predicate: quad.predicate.value,
    });
    if (contentNodes) {
      for (const contentNode of contentNodes) {
        const contentId = ensureId(contentNode as HTMLElement);
        if (quad.object.termType !== 'Literal') {
          throw new Error(
            'unexpected quad object type for quad referring to literal node',
          );
        }
        const { datatype, language } = quad.object;
        result.push({
          predicate: quad.predicate.value,
          object: sayDataFactory.literalNode(
            contentId,
            languageOrDataType(language, datatype),
          ),
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
  const rdfaId = element.getAttribute('__rdfaId') || uuidv4();
  element.setAttribute('__rdfaId', rdfaId);
  return rdfaId;
}
