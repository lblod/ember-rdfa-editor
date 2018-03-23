import Component from '@ember/component';
import layout from '../templates/components/document-structure';
import NodeWalker from '@lblod/ember-contenteditable-editor/utils/node-walker';
import { isDisplayedAsBlock } from '@lblod/ember-contenteditable-editor/utils/dom-helpers';
import { isRdfaNode } from '@lblod/ember-contenteditable-editor/utils/rdfa-rich-node-helpers';
import forgivingAction from '@lblod/ember-contenteditable-editor/utils/forgiving-action';
import { computed, get } from '@ember/object';
import Object from '@ember/object';
import { isEmpty } from '@ember/utils';
import { isBlank } from '@ember/utils';

const isInterestingNode = node => isDisplayedAsBlock(get(node,'domNode')) && isRdfaNode(node);
const flatten = function(arr, result = []) {
  for (let i = 0, length = arr.length; i < length; i++) {
    const value = arr[i];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
};


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
    let structure = this.buildStructure(richNode);
    return structure;
  }),
  buildStructure(node) {
    let subStructures;
    let domNode;
    if (isInterestingNode(node)) {
      domNode = get(node, 'domNode');
      subStructures = get(node, 'children').map(child => this.buildStructure(child)).filter(a => ! isEmpty(a));

      let title;
      ['about', 'property', 'typeof'].forEach( (property) => {
        if (domNode.getAttribute(property)) {
          title = domNode.getAttribute(property);
        }
      });
      if (isBlank(title))
        console.log(node);
      return Object.create({
        node: domNode,
        title: title,
        children: flatten(subStructures)
      });
    }
    else if (get(node, 'children')){
      return get(node, 'children').map(child => this.buildStructure(child, parent)).filter(a => ! isEmpty(a));
    }
  },
  init() {
    this._super(...arguments);
  },
  actions: {
    itemClicked(node) {
      forgivingAction('itemClicked',this)(node);
    }
  }
});
