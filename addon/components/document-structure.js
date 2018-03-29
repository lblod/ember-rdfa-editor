import Component from '@ember/component';
import layout from '../templates/components/document-structure';
import NodeWalker from '@lblod/ember-contenteditable-editor/utils/node-walker';
import { tagName, isDisplayedAsBlock } from '@lblod/ember-contenteditable-editor/utils/dom-helpers';
import { isRdfaNode } from '../utils/rdfa-rich-node-helpers';
import forgivingAction from '@lblod/ember-contenteditable-editor/utils/forgiving-action';
import { get } from '@ember/object';
import Object from '@ember/object';
import { isEmpty } from '@ember/utils';
import { once } from '@ember/runloop';

const isInterestingNode = node => isDisplayedAsBlock(get(node,'domNode')) && isRdfaNode(node) && ! ['i', 'img'].includes(tagName(get(node,'domNode')));
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
  node: null,
  nodeObserver: null,
  didUpdateAttrs() {

    if (this.get('nodeObserver'))
      this.get('nodeObserver').disconnect();

    let parseNode = () => {
      once(this, function() {
        let domNode = this.get('node');
        if (domNode == null)
          return;
        const nodeWalker = NodeWalker.create();
        const richNode = nodeWalker.processDomNode(domNode);
        let structure = this.buildStructure(richNode);
        this.set('items', structure);
      });
    };
    const nodeObserver = new MutationObserver(parseNode);
    const node = this.get('node');

    if (node) {
      parseNode();
      nodeObserver.observe(node, { subtree: true, attributes: true, childList: true });
    }
    this.set('nodeObserver', nodeObserver);
  },
  willDestroyElement() {
    this.get('nodeObserver').disconnect();
  },
  
  buildStructure(node) {
    let subStructures;
    let domNode;
    if (isInterestingNode(node)) {
      domNode = get(node, 'domNode');
      subStructures = get(node, 'children').map(child => this.buildStructure(child)).filter(a => ! isEmpty(a));


      let typeOf = domNode.getAttribute('typeof') ? `(${domNode.getAttribute('typeof')})` : '';
      let property = domNode.getAttribute('property') ? `--${domNode.getAttribute('property')}->` : '';
      let resource = domNode.getAttribute('resource') ? `${domNode.getAttribute('resource')}` : '';
      resource = domNode.getAttribute('about') ? `${domNode.getAttribute('about')}` : resource;
      resource = domNode.getAttribute('href') ? `${domNode.getAttribute('href')}` : resource;

      let title = `${property} ${resource} ${typeOf}`;
      return Object.create({
        node: domNode,
        title: title,
        children: flatten(subStructures)
      });
    }
    else if (get(node, 'children')){
      return get(node, 'children').map(child => this.buildStructure(child, parent)).filter(a => ! isEmpty(a));
    }
    return [];
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
