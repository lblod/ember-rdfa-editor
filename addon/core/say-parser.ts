import { v4 as uuidv4 } from 'uuid';
import {
  DOMParser as ProseParser,
  Node as PNode,
  ParseOptions,
  ParseRule,
  Schema,
  Slice,
} from 'prosemirror-model';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import Datastore, {
  EditorStore,
} from '@lblod/ember-rdfa-editor/utils/_private/datastore/datastore';
import { enhanceRule } from '@lblod/ember-rdfa-editor/core/schema';
import { SayStore } from '../plugins/datastore';
import { ModelQuad } from '../utils/_private/rdfa-parser/rdfa-parser';
import { Quad } from '@rdfjs/types';

export interface OutgoingNodeProp {
  type: 'node';
  predicate: string;
  object: string;
  nodeId: string;
}

export interface OutgoingAttrProp {
  type: 'attr';
  predicate: string;
  object: string;
}

export type OutgoingProp = OutgoingNodeProp | OutgoingAttrProp;

export interface IncomingProp {
  predicate: string;
  subject: string;
  subjectId?: string;
}

export default class SayParser extends ProseParser {
  constructor(schema: Schema, rules: readonly ParseRule[]) {
    super(schema, rules);
  }

  parse(dom: Node, options?: ParseOptions | undefined): PNode {
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

    // every resource node
    for (const [node, subject] of datastore.getResourceNodeMap().entries()) {
      const outgoingProps: OutgoingProp[] = [];
      // get all quads that have our subject
      const outgoingQuads = datastore.match(subject).asQuadResultSet();
      for (const quad of outgoingQuads) {
        outgoingProps.push(this.quadToOutgoing(datastore, quad));
      }

      const incomingProps: IncomingProp[] = [];
      const incomingQuads = datastore.match(null, null, subject);
      for (const quad of incomingQuads.asQuadResultSet()) {
        incomingProps.push(this.quadToIncoming(datastore, quad));
      }

      // write info to node
      (node as HTMLElement).dataset.outgoingProps =
        JSON.stringify(outgoingProps);
      (node as HTMLElement).dataset.incomingProps =
        JSON.stringify(incomingProps);
      (node as HTMLElement).dataset.rdfaNodeType = 'resource';
    }
    // each content node
    for (const [node, object] of datastore.getContentNodeMap().entries()) {
      const incomingProps: IncomingProp[] = [];
      const { subject, predicate } = object;
      // find quads that refer to us
      const quads = datastore
        .match(subject, `>${predicate.value}`)
        .asQuadResultSet();
      for (const quad of quads) {
        incomingProps.push(this.quadToIncoming(datastore, quad));
      }
      // write info to node
      (node as HTMLElement).dataset.incomingProps =
        JSON.stringify(incomingProps);
    }

    return super.parse(dom, options);
  }

  private quadToOutgoing(datastore: Datastore<Node>, quad: Quad): OutgoingProp {
    // check if quad refers to a contentNode
    const contentNode = datastore
      .getContentNodeMap()
      .getValue({ subject: quad.subject, predicate: quad.predicate });
    if (contentNode) {
      const contentId = ensureId(contentNode as HTMLElement);
      return {
        type: 'node',
        nodeId: contentId,
        object: quad.object.value,
        predicate: quad.predicate.value,
      };
    } else {
      // check if this quad refers to a resourceNode
      if (
        quad.object.termType === 'BlankNode' ||
        quad.object.termType === 'NamedNode'
      ) {
        const resourceNode = datastore
          .getResourceNodeMap()
          .getValue(quad.object);
        if (resourceNode) {
          const subjectId = ensureId(resourceNode as HTMLElement);
          return {
            type: 'node',
            nodeId: subjectId,
            object: quad.object.value,
            predicate: quad.predicate.value,
          };
        }
      }
      // neither a content nor resource node, so just a plain attribute
      return {
        type: 'attr',
        object: quad.object.value,
        predicate: quad.predicate.value,
      };
    }
  }

  private quadToIncoming(datastore: Datastore<Node>, quad: Quad): IncomingProp {
    // check if theres a resource node for the subject
    const resourceNode = datastore.getResourceNodeMap().getValue(quad.subject);
    if (resourceNode) {
      const subjectId = ensureId(resourceNode as HTMLElement);
      return {
        subjectId,
        subject: quad.subject.value,
        predicate: quad.predicate.value,
      };
    } else {
      return {
        subject: quad.subject.value,
        predicate: quad.predicate.value,
      };
    }
  }

  parseSlice(dom: Node, options?: ParseOptions): Slice {
    console.log('parseSlice in custom parser');
    return super.parseSlice(dom, options);
  }

  static schemaRules(schema: Schema) {
    const result: ParseRule[] = [];

    function insert(rule: ParseRule) {
      const priority = rule.priority == null ? 50 : rule.priority;
      let i = 0;
      for (; i < result.length; i++) {
        const next = result[i],
          nextPriority = next.priority == null ? 50 : next.priority;
        if (nextPriority < priority) break;
      }
      result.splice(i, 0, rule);
    }

    for (const name in schema.marks) {
      const rules = schema.marks[name].spec.parseDOM;
      if (rules) {
        rules.forEach((rule) => {
          insert((rule = enhanceRule(rule as Record<string, unknown>)));
          if (!(rule.mark || rule.ignore || rule.clearMark)) {
            rule.mark = name;
          }
        });
      }
    }
    for (const name in schema.nodes) {
      const rules = schema.nodes[name].spec.parseDOM;
      if (rules) {
        rules.forEach((rule) => {
          insert((rule = enhanceRule(rule as Record<string, unknown>)));
          if (!(rule.node || rule.ignore || rule.mark)) {
            rule.node = name;
          }
        });
      }
    }
    return result;
  }

  static fromSchema(schema: Schema): SayParser {
    return (
      (schema.cached.domParser as SayParser) ||
      (schema.cached.domParser = new SayParser(
        schema,
        SayParser.schemaRules(schema),
      ))
    );
  }
}

function ensureId(element: HTMLElement): string {
  const rdfaId = element.getAttribute('__rdfaId') || uuidv4();
  element.setAttribute('__rdfaId', rdfaId);
  return rdfaId;
}
