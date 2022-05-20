import { set } from '@ember/object';
import RichNode from '@lblod/marawa/rich-node';
import { rdfaKeywords } from '../../config/rdfa';

// TODO: content-editable should not be rdfa aware

/**
 * Get the RDFa attributes of a DOM node
 *
 * @method getRdfaAttributes
 *
 * @param {Node} domNode DOM node to get the RDFa attributes from
 *
 * @return {Object} Map of RDFa attributes key-value pairs
 *
 * @private
 */
const getRdfaAttributes = function (domNode: Element) {
  const rdfaAttributes: Record<string, string | null> = {};

  if (domNode && domNode.getAttribute) {
    rdfaKeywords.forEach(function (key) {
      rdfaAttributes[key] = domNode.getAttribute(key);
    });

    if (rdfaAttributes['typeof'] != null)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      rdfaAttributes['typeof'] = rdfaAttributes['typeof'].split(' ');
  }

  rdfaAttributes['text'] = domNode.textContent;

  return rdfaAttributes;
};

/**
 * Enrich a rich node recursively with its RDFa attributes
 *
 * @method enrichRichNodeWithRdfa
 *
 * @param {RichNode} richNode Rich node to enrich with its RDFa attributes
 *
 * @private
 */
const enrichRichNodeWithRdfa = function (richNode: RichNode) {
  const rdfaAttributes = getRdfaAttributes(richNode.domNode as Element);
  set(richNode, 'rdfaAttributes', rdfaAttributes);

  if (richNode.children) {
    richNode.children.forEach((child) => {
      enrichRichNodeWithRdfa(child);
    });
  }
};

/**
 * Returns whether a given RDFa attributes object is empty. This means no RDFa statement is set.
 *
 * @method isEmptyRdfaAttributes
 *
 * @param {Object} rdfaAttributes An RDFa attributes object
 *
 * @return {boolean} Whether the given RDFa attributes object is empty.
 *
 * @private
 */
const isEmptyRdfaAttributes = function (
  rdfaAttributes: Record<string, unknown>
) {
  return rdfaKeywords
    .map(function (key) {
      return rdfaAttributes[key] == null;
    })
    .reduce(function (a, b) {
      return a && b;
    });
};

const isRdfaNode = function (richNode: RichNode) {
  enrichRichNodeWithRdfa(richNode);
  return !isEmptyRdfaAttributes(richNode.rdfaAttributes);
};

export {
  getRdfaAttributes,
  isRdfaNode,
  isEmptyRdfaAttributes,
  enrichRichNodeWithRdfa,
};
