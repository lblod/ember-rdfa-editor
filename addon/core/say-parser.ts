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

export default class SayParser extends ProseParser {
  constructor(schema: Schema, rules: readonly ParseRule[]) {
    console.log('making new parser');
    super(schema, rules);
  }

  parse(dom: Node, options?: ParseOptions | undefined): PNode {
    console.log('parse in custom parser');
    console.log('starting rdfa parser');
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

    for (const entry of datastore.asSubjectNodeMapping()) {
      const { term, nodes } = entry;
      for (const node of nodes) {
        const outgoingQuads = datastore.match(term);
        const outgoingProps = [];

        for (const quad of outgoingQuads.asQuadResultSet()) {
          const objectNodes = outgoingQuads.nodesForQuad(quad)?.objectNodes;

          if (objectNodes) {
            for (const objectNode of objectNodes) {
              if (
                objectNode === node ||
                (objectNode as HTMLElement).getAttribute('content') ===
                  quad.object.value
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
                  object: rdfaId,
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
        (node as HTMLElement).dataset.outgoingProps =
          JSON.stringify(outgoingProps);
      }
    }
    for (const entry of datastore.asObjectNodeMapping()) {
      const { term, nodes } = entry;

      for (const node of nodes) {
        const incomingQuads = datastore.match(null, null, term);
        const incomingProps = [
          ...incomingQuads.asQuadResultSet().map((quad) => {
            return {
              predicate: quad.predicate.value,
              subject: quad.subject.value,
            };
          }),
        ];
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
          insert((rule = copy(rule as Record<string, unknown>)));
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
          insert((rule = copy(rule as Record<string, unknown>)));
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

function copy(obj: Record<string, unknown>) {
  const copy: Record<string, unknown> = {};
  for (const prop in obj) {
    copy[prop] = obj[prop];
  }
  return copy;
}

function ensureId(element: HTMLElement): string {
  const rdfaId = element.getAttribute('__rdfaId') || uuidv4();
  element.setAttribute('__rdfaId', rdfaId);
  return rdfaId;
}
