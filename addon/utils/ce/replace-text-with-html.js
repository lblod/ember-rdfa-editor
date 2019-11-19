import flatMap from './flat-map';
import { get } from '@ember/object';
import { debug } from '@ember/debug';
import { createElementsFromHTML } from './dom-helpers';
/**
 * Replaces text with html, updates DOM
 * finds the node that contains the whole rang
 * from that node keeps children that are outside the range
 * for other children transforms textContent outside to range to new text nodes
 * new element is inserted in between
 * e.g. <div><p>foo <span style="color:blue">oooo ffff oooo</span>sss</p> currently becomes <div><p>foo oooo <div>new element</div>sss</p></div>
 * TODO: transforming elements to text nodes could be improved by keeping the original element.
 * @method replaceTextWithHtml
 *
 * @param {RichNode} RichNode
 * @param {int} startIndex
 * @param {int} endIndex
 * @param {String} htmlString
 *
 * @return {RichNode} inserted html as richNode
 */
export default function replaceTextWithHtml(richNode, start, end, html) {
  if(start > end) throw new Error(`start index: ${start} > end index ${end}`);

  let filter = node => { return node.start <= start && node.end >= end; };

  let nodes = flatMap(richNode, filter);
  if(nodes.length === 0) throw new Error('No matching nodes found');

  let nodeContainingText = nodes[nodes.length-1];
  let newElements = createElementsFromHTML(html);
  if (get(nodeContainingText, 'type') === 'text') {
    let textNodeParent = get(nodeContainingText, 'parent.domNode');
    let textNode = get(nodeContainingText,'domNode');
    let startOfNode = get(nodeContainingText,'start');
    if (startOfNode < start) {
      let startNode = sliceTextNode(textNode, 0, start - startOfNode );
      textNodeParent.insertBefore(startNode, textNode);
    }
    newElements.forEach(newElement => textNodeParent.insertBefore(newElement, textNode));
    let endOfNode = get(nodeContainingText, 'end');
    if (endOfNode > end) {
      let endNode  = sliceTextNode(textNode, end - startOfNode, textNode.textContent.length);
      textNodeParent.insertBefore(endNode, textNode);
    }
    textNodeParent.removeChild(textNode);
  }
  else if (get(nodeContainingText, 'type') === 'tag') {
    debug('replaceTextWithHTML: text contained in a tag, possibly spanning nodes');
    let children = get(nodeContainingText, 'children');
    let newChildren = [];
    let parentNode = get(nodeContainingText, 'domNode');
    let startingBeforeRange = children.filter( child => get(child, 'end') <= end && get(child, 'start') <= start);
    startingBeforeRange.forEach( before => {
      // the node overlaps with the specified range, we keep the part before the range
      if (get(before, 'end') <= start)
        newChildren.push(get(before, 'domNode'));
      else {
        let domNode = get(before, 'domNode');
        let newStart = sliceTextNode(domNode, 0, start - get(before, 'start'));
        newChildren.push(newStart);
      }
    });
    // nodes contained in the range are replaced with the new element
    newChildren.pushObjects(newElements);
    let endingAfterRange = children.filter( child => get(child, 'end') > end && get(child, 'start') >= start);
    endingAfterRange.forEach( after => {
      if (get(after, 'start') >= end)
        newChildren.push(get(after, 'domNode'));
      else {
        // the node overlaps with the specified range, we keep the part after the range
        let domNode = get(after, 'domNode');
        let newAfter = sliceTextNode(domNode, end - get(after, 'start'), get(after, 'domNode').textContent.length);
        newChildren.push(newAfter);
      }
    });

    while (parentNode.firstChild) {
      parentNode.removeChild(parentNode.firstChild);
    }
    newChildren.forEach(child => parentNode.appendChild(child));
  }
  else {

    throw new Error('unsupported range for replaceText');
  }
  return newElements;
}

function sliceTextNode(node, start, end) {
  return document.createTextNode(node.textContent.slice(start,end));
}
