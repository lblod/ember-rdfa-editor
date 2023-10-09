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
import { EditorStore } from '@lblod/ember-rdfa-editor/utils/_private/datastore/datastore';
import { enhanceRule } from '@lblod/ember-rdfa-editor/core/schema';

export interface OugoingNodeProp {
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

export type OutgoingProp = OugoingNodeProp | OutgoingAttrProp;

export interface IncomingProp {
  predicate: string;
  subject: string;
  subjectId: string;
}

export default class SayParser extends ProseParser {
  constructor(schema: Schema, rules: readonly ParseRule[]) {
    super(schema, rules);
  }

  parse(dom: Node, options?: ParseOptions | undefined): PNode {
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
    console.log([...datastore.asQuadResultSet()]);

    // for every subject in the document
    for (const entry of datastore.asSubjectNodeMapping()) {
      const { term, nodes } = entry;
      // there is rarely more than one node, but it is possible. This means
      // two nodes are talking about the same subject
      for (const node of nodes.filter(
        (node) => (node as HTMLElement).getAttribute('resource') === term.value,
      )) {
        // constrain the datastore to quads for which our subject is the subject
        const outgoingQuads = datastore.match(term);

        const outgoingProps: OutgoingProp[] = [];
        // for every quad in the constrained set, aka all quads for which we are
        // the subject
        for (const quad of outgoingQuads.asQuadResultSet()) {
          // find the nodes that define the object for this quad.
          // is rarely more than 1, but can happen
          // TODO: it might be a bug if this happens, need to define how this mapping should work
          const objectNodes = outgoingQuads.nodesForQuad(quad)?.objectNodes;

          // should essentially always exist
          if (objectNodes) {
            for (const objectNode of objectNodes) {
              // this is an early attempt at separating the following two cases:
              // - the value of a property is determined by the textcontent of a
              // childnode: this means that we can edit that content directly in the editor later.
              // - other cases: either it's defined on the subject node, for example a type predicate,
              // or it is defined on a child node but as a content attribute, and thus invisible in the editor
              if (
                objectNode === node ||
                (objectNode as HTMLElement).getAttribute('content') ||
                quad.predicate.value === 'eli:language'
              ) {
                outgoingProps.push({
                  predicate: quad.predicate.value,
                  object: quad.object.value,
                  type: 'attr',
                });
              } else {
                const rdfaId = ensureId(objectNode as HTMLElement);
                outgoingProps.push({
                  predicate: quad.predicate.value,
                  object: quad.object.value,
                  nodeId: rdfaId,
                  type: 'node',
                });
              }
            }
          } else {
            outgoingProps.push({
              predicate: quad.predicate.value,
              object: quad.object.value,
              type: 'attr',
            });
          }
        }
        console.log('outgoing', outgoingProps);
        (node as HTMLElement).dataset.outgoingProps =
          JSON.stringify(outgoingProps);
      }
    }
    for (const entry of datastore.asObjectNodeMapping()) {
      const { term, nodes } = entry;

      for (const node of nodes) {
        const incomingProps: IncomingProp[] = [];
        const incomingQuads = datastore.match(null, null, term);

        for (const quad of incomingQuads.asQuadResultSet()) {
          const subjectNodes =
            incomingQuads.nodesForQuad(quad)?.subjectNodes ?? [];

          for (const subjectNode of subjectNodes) {
            if (
              !(subjectNode as HTMLElement).getAttribute('about') &&
              subjectNode !== node
            ) {
              console.log(
                'subjectnode',
                quad.subject.value,
                quad.predicate.value,
                subjectNode,
              );
              const rdfaId = ensureId(subjectNode as HTMLElement);
              incomingProps.push({
                predicate: quad.predicate.value,
                subject: quad.subject.value,
                subjectId: rdfaId,
              });
            }
          }
        }
        (node as HTMLElement).dataset.incomingProps =
          JSON.stringify(incomingProps);
      }
    }
    return super.parse(dom, options);
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
