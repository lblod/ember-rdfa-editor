import * as RDF from '@rdfjs/types';
import { v4 as uuidv4 } from 'uuid';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import Datastore, {
  EditorStore,
} from '@lblod/ember-rdfa-editor/utils/_private/datastore/datastore';
import { Quad } from '@rdfjs/types';

// export type ExternalPropertyObject =
//   | {
//       type: 'literal';
//       rdfaId: string;
//     }
//   | {
//       type: 'resource';
//       resource: string;
//     };
// export type ExternalProperty = {
//   type: 'external';
//   predicate: string;
//   object: ExternalPropertyObject;
// };

// export type AttributeProperty = {
//   type: 'attribute';
//   predicate: string;
//   object: string;
// };
// export type Property = AttributeProperty | ExternalProperty;

export interface LiteralNodeObject {
  termType: 'LiteralNode';
  rdfaId: string;
}
export interface ResourceNodeObject {
  termType: 'ResourceNode';
  value: string;
}
export type SayRDFLiteral = Pick<
  RDF.Literal,
  'value' | 'termType' | 'language'
> & {
  datatype: Omit<RDF.NamedNode, 'equals'>;
};

export type PlainObject =
  | SayRDFLiteral
  | Omit<RDF.NamedNode, 'equals'>
  | Omit<RDF.BlankNode, 'equals'>;
export type NodeLinkObject = ResourceNodeObject | LiteralNodeObject;
export type OutgoingTripleObject = PlainObject | NodeLinkObject;
export type LinkTriple = {
  predicate: string;
  object: NodeLinkObject;
};

export type PlainTriple = {
  predicate: string;
  object: PlainObject;
};
export type OutgoingTriple = PlainTriple | LinkTriple;

/**
 * @deprecated use {@link IncomingTriple} instead
 */
export type Backlink = {
  subject: string;
  predicate: string;
};

export type IncomingTriple = Backlink;
/**
 * Function responsible for computing the properties and backlinks of a given document.
 * The properties and backlinks are stored in data-attributes in the nodes themselves.
 */
export function preprocessRDFa(dom: Node) {
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
    pathFromDomRoot: [],
    textContent(node: Node): string {
      return node.textContent || '';
    },
  });
  for (const quad of datastore.asQuadResultSet()) {
    console.log('quad', quad);
  }

  // every resource node
  for (const [node, subject] of datastore.getResourceNodeMap().entries()) {
    const properties: OutgoingTriple[] = [];
    // get all quads that have our subject
    const outgoingQuads = datastore.match(subject).asQuadResultSet();
    const seenLinks = new Set<string>();
    for (const quad of outgoingQuads) {
      quadToProperties(datastore, quad).forEach((prop) => {
        if (prop.object.termType === 'LiteralNode') {
          if (!seenLinks.has(prop.object.rdfaId)) {
            seenLinks.add(prop.object.rdfaId);
            properties.push(prop);
          }
        } else {
          properties.push(prop);
        }
      });
    }

    const incomingProps: IncomingTriple[] = [];
    const incomingQuads = datastore.match(null, null, subject);
    for (const quad of incomingQuads.asQuadResultSet()) {
      incomingProps.push(quadToBacklink(quad));
    }

    // write info to node
    (node as HTMLElement).dataset.outgoingProps = JSON.stringify(properties);
    (node as HTMLElement).dataset.incomingProps = JSON.stringify(incomingProps);
    (node as HTMLElement).dataset.rdfaNodeType = 'resource';
  }
  // each content node
  for (const [node, object] of datastore.getContentNodeMap().entries()) {
    const { subject, predicate } = object;
    const incomingProp: IncomingTriple = {
      subject: subject.value,
      predicate: predicate.value,
    };
    // write info to node
    (node as HTMLElement).dataset.incomingProps = JSON.stringify([
      incomingProp,
    ]);
    (node as HTMLElement).dataset.rdfaNodeType = 'literal';
  }
}

function quadToProperties(
  datastore: Datastore<Node>,
  quad: Quad,
): OutgoingTriple[] {
  const result: OutgoingTriple[] = [];
  // check if quad refers to a contentNode
  const contentNodes = datastore
    .getContentNodeMap()
    .getValues({ subject: quad.subject, predicate: quad.predicate });
  if (contentNodes) {
    for (const contentNode of contentNodes) {
      const contentId = ensureId(contentNode as HTMLElement);
      result.push({
        predicate: quad.predicate.value,
        object: {
          termType: 'LiteralNode',
          rdfaId: contentId,
        },
      });
    }
    return result;
  } else {
    // check if this quad refers to a resourceNode
    if (
      quad.object.termType === 'BlankNode' ||
      quad.object.termType === 'NamedNode'
    ) {
      const resourceNode = datastore
        .getResourceNodeMap()
        .getFirstValue(quad.object);
      if (resourceNode) {
        return [
          {
            predicate: quad.predicate.value,
            object: { termType: 'ResourceNode', value: quad.object.value },
          },
        ];
      } else {
        return [{ predicate: quad.predicate.value, object: quad.object }];
      }
    }
    // neither a content nor resource node, so just a plain attribute
    if (quad.object.termType === 'Literal') {
      return [
        {
          predicate: quad.predicate.value,
          object: quad.object,
        },
      ];
    } else {
      // termtype === 'Variable', which we don't support.
      return [];
    }
  }
}

function quadToBacklink(quad: Quad): IncomingTriple {
  // check if theres a resource node for the subject
  return {
    subject: quad.subject.value,
    predicate: quad.predicate.value,
  };
}

function ensureId(element: HTMLElement): string {
  const rdfaId = element.getAttribute('__rdfaId') || uuidv4();
  element.setAttribute('__rdfaId', rdfaId);
  return rdfaId;
}
