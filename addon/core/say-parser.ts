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
import { Quad } from '@rdfjs/types';

export type ExternalProperty = {
  type: 'external';
  predicate: string;
  object:
    | {
        type: 'literal';
        rdfaId: string;
      }
    | {
        type: 'resource';
        resource: string;
      };
};

export type AttributeProperty = {
  type: 'attribute';
  predicate: string;
  object: string;
};
export type Property = AttributeProperty | ExternalProperty;

export type Backlink = {
  subject: string;
  predicate: string;
};

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
      const properties: Property[] = [];
      // get all quads that have our subject
      const outgoingQuads = datastore.match(subject).asQuadResultSet();
      const seenLinks = new Set<string>();
      for (const quad of outgoingQuads) {
        this.quadToProperties(datastore, quad).forEach((prop) => {
          if (prop.type === 'external' && prop.object.type === 'literal') {
            if (!seenLinks.has(prop.object.rdfaId)) {
              seenLinks.add(prop.object.rdfaId);
              properties.push(prop);
            }
          } else {
            properties.push(prop);
          }
        });
      }

      const incomingProps: Backlink[] = [];
      const incomingQuads = datastore.match(null, null, subject);
      for (const quad of incomingQuads.asQuadResultSet()) {
        incomingProps.push(this.quadToBacklink(quad));
      }

      // write info to node
      (node as HTMLElement).dataset.outgoingProps = JSON.stringify(properties);
      (node as HTMLElement).dataset.incomingProps =
        JSON.stringify(incomingProps);
      (node as HTMLElement).dataset.rdfaNodeType = 'resource';
    }
    // each content node
    for (const [node, object] of datastore.getContentNodeMap().entries()) {
      const { subject, predicate } = object;
      const incomingProp: Backlink = {
        subject: subject.value,
        predicate: predicate.value,
      };
      // write info to node
      (node as HTMLElement).dataset.incomingProps = JSON.stringify([
        incomingProp,
      ]);
      (node as HTMLElement).dataset.rdfaNodeType = 'content';
    }

    return super.parse(dom, options);
  }

  private quadToProperties(datastore: Datastore<Node>, quad: Quad): Property[] {
    const result: Property[] = [];
    // check if quad refers to a contentNode
    const contentNodes = datastore
      .getContentNodeMap()
      .getValues({ subject: quad.subject, predicate: quad.predicate });
    if (contentNodes) {
      console.log('quadToOut', quad, contentNodes);
      for (const contentNode of contentNodes) {
        const contentId = ensureId(contentNode as HTMLElement);
        result.push({
          type: 'external',
          predicate: quad.predicate.value,
          object: {
            type: 'literal',
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
              type: 'external',
              predicate: quad.predicate.value,
              object: {
                type: 'resource',
                resource: quad.object.value,
              },
            },
          ];
        }
      }
      // neither a content nor resource node, so just a plain attribute
      return [
        {
          type: 'attribute',
          predicate: quad.predicate.value,
          object: quad.object.value,
        },
      ];
    }
  }

  private quadToBacklink(quad: Quad): Backlink {
    // check if theres a resource node for the subject
    return {
      subject: quad.subject.value,
      predicate: quad.predicate.value,
    };
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
