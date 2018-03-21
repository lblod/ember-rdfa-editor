import Component from '@ember/component';
import layout from '../templates/components/document-structure';
import NodeWalker from '@lblod/ember-contenteditable-editor/utils/node-walker';
import flatMap from '@lblod/ember-contenteditable-editor/utils/flat-map';
import { isDisplayedAsBlock } from '@lblod/ember-contenteditable-editor/utils/dom-helpers';
import { isRdfaNode } from '@lblod/ember-contenteditable-editor/utils/rdfa-rich-node-helpers';
import { computed, get } from '@ember/object';
export default Component.extend({
  layout,
  classNames: ["col--3-12 flex"],
  domTree: null,
  items: computed('domTree', function() {
    let domNode = this.get('domTree');
    if (domNode == null)
      return null;
    const nodeWalker = NodeWalker.create();
    const richNode = nodeWalker.processDomNode(domNode);
    const filter = node => isDisplayedAsBlock(get(node,'domNode')) && isRdfaNode(node);
    let interestingNodes = flatMap(richNode, filter);
    debugger;
    return interestingNodes.map( node => get(node, 'domNode').getAttribute('typeof'));
  }),
  init() {
    this._super(...arguments);
  }
});
