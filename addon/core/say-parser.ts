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

    for (const [node, subject] of datastore.asResourceNodeMapping().entries()) {
      const outgoingProps: OutgoingProp[] = [];
      const outgoingQuads = datastore.match(subject).asQuadResultSet();
      for (const quad of outgoingQuads) {
        const entry = [...datastore.asContentNodeMapping().entries()].find(
          ([_node, { subject, predicate }]) =>
            subject.equals(quad.subject) && predicate === quad.predicate.value,
        );
        if (entry) {
          const [contentNode] = entry;
          const contentId = ensureId(contentNode as HTMLElement);
          outgoingProps.push({
            type: 'node',
            nodeId: contentId,
            object: quad.object.value,
            predicate: quad.predicate.value,
          });
        } else {
          const subjEntry = [
            ...datastore.asResourceNodeMapping().entries(),
          ].find(([_node, subject]) => subject.equals(quad.object));

          if (subjEntry) {
            const [subjectNode] = subjEntry;
            const subjectId = ensureId(subjectNode as HTMLElement);
            outgoingProps.push({
              type: 'node',
              nodeId: subjectId,
              object: quad.object.value,
              predicate: quad.predicate.value,
            });
          } else {
            outgoingProps.push({
              type: 'attr',
              object: quad.object.value,
              predicate: quad.predicate.value,
            });
          }
        }
      }

      (node as HTMLElement).dataset.outgoingProps =
        JSON.stringify(outgoingProps);

      const incomingProps: IncomingProp[] = [];
      const incomingQuads = datastore.match(null, null, subject);
      for (const quad of incomingQuads.asQuadResultSet()) {
        const entry = [...datastore.asResourceNodeMapping().entries()].find(
          ([_node, subject]) => subject === quad.subject,
        );
        if (entry) {
          const [resourceNode] = entry;
          const subjectId = ensureId(resourceNode as HTMLElement);
          incomingProps.push({
            subjectId,
            subject: quad.subject.value,
            predicate: quad.predicate.value,
          });
        } else {
          incomingProps.push({
            subject: quad.subject.value,
            predicate: quad.predicate.value,
          });
        }
      }
      (node as HTMLElement).dataset.incomingProps =
        JSON.stringify(incomingProps);
      (node as HTMLElement).dataset.rdfaNodeType = 'resource';
    }
    for (const [node, object] of datastore.asContentNodeMapping().entries()) {
      const incomingProps: IncomingProp[] = [];
      const { subject, predicate } = object;
      const quads = datastore.match(subject, `>${predicate}`).asQuadResultSet();
      for (const quad of quads) {
        const entry = [...datastore.asResourceNodeMapping().entries()].find(
          ([_node, subject]) => subject === quad.subject,
        );
        if (entry) {
          const [resourceNode] = entry;
          const subjectId = ensureId(resourceNode as HTMLElement);
          incomingProps.push({
            subjectId,
            subject: quad.subject.value,
            predicate: quad.predicate.value,
          });
        } else {
          incomingProps.push({
            subject: quad.subject.value,
            predicate: quad.predicate.value,
          });
        }
      }

      (node as HTMLElement).dataset.incomingProps =
        JSON.stringify(incomingProps);
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
