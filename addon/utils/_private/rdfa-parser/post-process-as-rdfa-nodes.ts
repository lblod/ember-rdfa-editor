import { unwrap } from '../option';
import { IActiveTag } from './active-tag';
import { ModelBlankNode, ModelNamedNode } from './rdfa-parser';
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
    if (!('rel' in attributes) && !('rev' in attributes)) {
      if (
        'property' in attributes &&
        !('content' in attributes) &&
        !('datatype' in attributes)
      ) {
        if ('about' in attributes && !('data-literal-node' in attributes)) {
          console.log('activetag 1', activeTag.predicates);
          // !! content node
          // this combo BOTH sets a new subject, AND sets the value of the triple to its textcontent.
          // we choose to interpret as a literal rather than a resource
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
          if ('typeof' in attributes) {
            markAsResourceNode(node, unwrap(typedResource), activeTag);
            return;
          }
        }
      } else {
        if ('about' in attributes && !('data-literal-node' in attributes)) {
          // same exception as above, we always interpret (property +about -content) cases as literal nodes
          console.log('activetag 2', activeTag.predicates);
          markAsResourceNode(
            node,
            unwrap(activeTag.subject),
            activeTag,
            activeTag.predicates?.find(
              (pred) => pred.value === attributes['property'],
            ),
            activeTag.datatype,
            activeTag.language
          );
          return;
        } else if (
          'href' in attributes ||
          'src' in attributes ||
          'resource' in attributes
        ) {
          markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
          return;
        } else if (isRootTag) {
          // root resource node
          markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
          return;
        } else if ('typeof' in attributes) {
          // blank resource node
          markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
          return;
        } else if (activeTag.object) {
          // intentionally empty, to preserve structure from algorithm in spec
        }
      }
    } else {
      if ('about' in attributes) {
        markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
        return;
      } else if ('typeof' in attributes) {
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
    if ('property' in attributes) {
      if ('datatype' in attributes) {
        if (!('content' in attributes)) {
          markAsLiteralNode(node, activeTag, attributes);
          return;
        }
      } else if ('content' in attributes) {
        return;
      } else if (
        !('rel' in attributes) &&
        !('rev' in attributes) &&
        !('content' in attributes) &&
        ('resource' in attributes ||
          'href' in attributes ||
          'src' in attributes)
      ) {
        markAsResourceNode(node, unwrap(activeTag.subject), activeTag);
        return;
      } else if ('typeof' in attributes && !('about' in attributes)) {
        return;
      } else {
        markAsLiteralNode(node, activeTag, attributes);
        return;
      }
    }
  }
}
