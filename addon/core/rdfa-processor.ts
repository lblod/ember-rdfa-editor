import * as RDF from '@rdfjs/types';
import { v4 as uuidv4 } from 'uuid';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import Datastore, {
  EditorStore,
  SubAndContentPred,
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
export type ContentLiteralObject = Omit<SayRDFLiteral, 'value' | 'termType'> & {
  termType: 'ContentLiteral';
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
export type ContentTriple = {
  predicate: string;
  object: ContentLiteralObject;
};
export type OutgoingTriple = PlainTriple | LinkTriple | ContentTriple;

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
  for (const [node, entry] of datastore.getResourceNodeMap().entries()) {
    const properties: OutgoingTriple[] = [];
    // get all quads that have our subject
    const outgoingQuads = datastore.match(entry.subject).asQuadResultSet();
    const seenLinks = new Set<string>();
    for (const quad of outgoingQuads) {
      quadToProperties(datastore, quad, entry).forEach((prop) => {
        console.log('prop', prop);
        if (prop.object.termType === 'LiteralNode') {
          if (!seenLinks.has(prop.object.rdfaId)) {
            seenLinks.add(prop.object.rdfaId);
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
    (node as HTMLElement).dataset.outgoingProps = JSON.stringify(properties);
    (node as HTMLElement).dataset.incomingProps = JSON.stringify(incomingProps);
    (node as HTMLElement).dataset.rdfaNodeType = 'resource';
    (node as HTMLElement).dataset.subject = entry.subject.value;
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
  entry: SubAndContentPred,
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
        .getFirstValue({ subject: quad.object });
      if (resourceNode) {
        return [
          {
            predicate: quad.predicate.value,
            object: { termType: 'ResourceNode', value: quad.object.value },
          },
        ];
      } else {
        return [
          // copying object to prevent weird bugs
          { predicate: quad.predicate.value, object: { ...quad.object } },
        ];
      }
    }
    // neither a content nor resource node, so just a plain attribute
    if (quad.object.termType === 'Literal') {
      const { contentDatatype, contentLanguage, contentPredicate } = entry;
      if (
        contentPredicate &&
        quad.predicate.equals(contentPredicate) &&
        (!contentDatatype || contentDatatype?.equals(quad.object.datatype)) &&
        (!contentLanguage || contentLanguage === quad.object.language)
      ) {
        return [
          {
            predicate: quad.predicate.value,
            object: {
              termType: 'ContentLiteral',
              datatype: quad.object.datatype,
              language: quad.object.language,
            },
          },
        ];
      }
      return [
        {
          predicate: quad.predicate.value,
          // need to copy the object here or weird stuff happens
          object: { ...quad.object, termType: 'Literal' },
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
