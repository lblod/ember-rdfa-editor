import { unwrap } from '../option.ts';
import type { IActiveTag } from './active-tag.ts';
import type { ModelBlankNode, ModelNamedNode } from './rdfa-parser.ts';
export interface PostProcessArgs<N> {
  activeTag: IActiveTag<N>;
  attributes: Record<string, string>;
  isRootTag: boolean;
  typedResource: true | ModelBlankNode<N> | ModelNamedNode<N> | null;
  markAsLiteralNode: (
    node: N,
    activeTag: IActiveTag<N>,
    attributes: Record<string, string>,
    predicateAttribute?: string,
  ) => void;
  markAsResourceNode: (
    node: N,
    resource: boolean | ModelBlankNode<N> | ModelNamedNode<N>,
    activeTag: IActiveTag<N>,
    contentPredicate?: ModelNamedNode<N>,
    contentDatatype?: ModelNamedNode<N>,
    contentLanguage?: string,
  ) => void;
}

/**
 * How the preprocessor works:
 *
 * some definitions:
 *
 * say you have a triple `<uri> predicate "object"`,
 * where "object" is the value of an attribute (such as content),
 * we call the tuple (predicate, "object") a property of <uri>
 *
 * if you have a triple <uri> predicate <uri2>, we call the tuple (predicate, <uri2>) a relationship of <uri>
 *
 * if you have a triple <uri> predicate "object",
 * where "object" is derived from the concatenated text content of a node,
 * we call the tuple (predicate, node) also a relationship of <uri>
 *
 * The core idea of the preprocessor is this: turn a random rdfa document,
 * which has resources and predicates all over the place, into a document with 2 types of nodes:
 *
 * - a resource node: defines a resource and, crucially, holds ALL properties and relationships of that resource, in both directions

 * - a literal node: the "manifestation" of a literal relationship on a resource
 *
 * now, this split maps nicely on the spec for the rdfa parsing algorithm.
 * Essentially, when visiting a node, there are 4 possible outcomes (that are relevant for us):
 *
 *     a. the node defines a new subject (we mark it as a resource node)
 *     b. it "closes" a triple by defining its value with the concatenated textcontent (we mark it as a literal node)
 *     c. it does both a and b (we mark it as a literal node, see below)
 *     d. it does anything else (we don't mark it)
 *
 * in the case of d, we can safely ignore it because of how the resource and literal nodes get processed later on.
 * We attach all their properties and relationships after we fully parse the document,
 * and the parser doesn't ignore d, so it captures all cases.
 *
 * This also means that before the nodes ever get to prosemirror,
 * all the relationships and properties are correctly attached, taking the entire document into account.

 * ## Special note
 *
 * the case where an element has both an about and a property attribute,
 * (this is case "c" from above) it will always get parsed as a literal node,
 * even if it technically also defines a subject.
 *
 * This means there can be literal nodes that point to a resource which does not have a resource node in the document.
 * This doesn't break anything and is actually completely sensible.
 * A node like this effectively defines a complete triple,
 * completely independant from the context it's in, with the value of about as the subject,
 * the value of property as predicate and the concatenated textcontent as the object.
 **/
export function postProcessTagAsRdfaNode<N>(args: PostProcessArgs<N>): void {
  const {
    activeTag,
    attributes,
    isRootTag,
    typedResource,
    markAsLiteralNode,
    markAsResourceNode,
  } = args;
  const node = activeTag.node;
  if (!activeTag.skipElement && node) {
    // no rel or rev
    if (
      !truthyAttribute(attributes, 'rel') &&
      !truthyAttribute(attributes, 'rev')
    ) {
      if (
        truthyAttribute(attributes, 'property') &&
        !truthyAttribute(attributes, 'content') &&
        !truthyAttribute(attributes, 'datatype')
      ) {
        if (
          truthyAttribute(attributes, 'about') &&
          !truthyAttribute(attributes, 'data-literal-node')
        ) {
          markAsResourceNode(
            node,
            unwrap(activeTag.subject),
            activeTag,
            activeTag.predicates?.find(
              (pred) => pred.value === attributes['property'],
            ),
            activeTag.datatype,
            activeTag.language,
          );
          return;
        } else if (isRootTag) {
          // root resource
          markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
          return;
        } else {
          if (truthyAttribute(attributes, 'typeof')) {
            markAsResourceNode(node, unwrap(typedResource), activeTag);
            return;
          }
        }
      } else {
        if (
          truthyAttribute(attributes, 'about') &&
          !truthyAttribute(attributes, 'data-literal-node')
        ) {
          // same exception as above, we always interpret (property +about -content) cases as literal nodes
          markAsResourceNode(
            node,
            unwrap(activeTag.subject),
            activeTag,
            activeTag.predicates?.find(
              (pred) => pred.value === attributes['property'],
            ),
            activeTag.datatype,
            activeTag.language,
          );
          return;
        } else if (
          truthyAttribute(attributes, 'href') ||
          truthyAttribute(attributes, 'src') ||
          truthyAttribute(attributes, 'resource')
        ) {
          markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
          return;
        } else if (isRootTag) {
          // root resource node
          markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
          return;
        } else if (truthyAttribute(attributes, 'typeof')) {
          // blank resource node
          markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
          return;
        } else if (
          truthyAttribute(attributes, 'data-literal-node') &&
          truthyAttribute(attributes, 'data-say-id')
        ) {
          markAsLiteralNode(node, activeTag, attributes);
          return;
        } else if (activeTag.object) {
          // intentionally empty, to preserve structure from algorithm in spec
        }
      }
    } else {
      if (truthyAttribute(attributes, 'about')) {
        markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
        return;
      } else if (truthyAttribute(attributes, 'typeof')) {
        markAsResourceNode(node, unwrap(typedResource), activeTag);
        return;
      } else if (isRootTag) {
        // root resource node
        markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
        return;
      } else if (activeTag.object) {
        // intentionally empty, to preserve structure from algorithm in spec
      }
    }

    // no-op returns are intentional
    if (truthyAttribute(attributes, 'property')) {
      if (truthyAttribute(attributes, 'datatype')) {
        if (!truthyAttribute(attributes, 'content')) {
          markAsLiteralNode(node, activeTag, attributes);
          return;
        }
      } else if (truthyAttribute(attributes, 'content')) {
        return;
      } else if (
        !truthyAttribute(attributes, 'rel') &&
        !truthyAttribute(attributes, 'rev') &&
        !truthyAttribute(attributes, 'content') &&
        (truthyAttribute(attributes, 'resource') ||
          truthyAttribute(attributes, 'href') ||
          truthyAttribute(attributes, 'src'))
      ) {
        markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
        return;
      } else if (
        truthyAttribute(attributes, 'typeof') &&
        !truthyAttribute(attributes, 'about')
      ) {
        return;
      } else {
        markAsLiteralNode(node, activeTag, attributes);
        return;
      }
    }
  }
}
function truthyAttribute(attrs: Record<string, string>, key: string) {
  if (key in attrs) {
    const value = attrs[key];
    if (value === '' || value === 'false') {
      return false;
    }
    return true;
  }
  return false;
}
