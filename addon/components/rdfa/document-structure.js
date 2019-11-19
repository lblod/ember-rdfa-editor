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

const labelForNode =  domNode => {
  let typeOf = domNode.getAttribute('typeof') ? `(${domNode.getAttribute('typeof')})` : '';
  let property = domNode.getAttribute('property') ? `--${domNode.getAttribute('property')}->` : '';
  let resource = domNode.getAttribute('resource') ? `${domNode.getAttribute('resource')}` : '';
  resource = domNode.getAttribute('about') ? `${domNode.getAttribute('about')}` : resource;
  resource = domNode.getAttribute('href') ? `${domNode.getAttribute('href')}` : resource;

  return `${property} ${resource} ${typeOf}`;
};
const isInterestingNode = (node) => {
  const dontshow = ['http://mu.semte.ch/vocabularies/ext/noHighlight'];
  const domNode = get(node, 'domNode');
  return domNode.nodeType === Node.ELEMENT_NODE && ! dontshow.includes(domNode.getAttribute('property')) && isDisplayedAsBlock(domNode) && isRdfaNode(node) && ! ['i', 'img'].includes(tagName(domNode));
};
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


/**
 * Document structure component
 *
 * @module rdfa-editor
 * @class DocumentStructureComponent
 * @extends Component
 */
export default Component.extend({
  layout,
  classNames: ["col--3-12 sidebar-wrapper"],
  classNameBindings: ["isCollapsed:col--collapsed"],

  /**
   * domNode to monitor
   * @property node
   * @type DOMElement
   * @default null
   * @public
   */
  node: null,

  /**
   * a MutationObserver on the specified node
   * @property nodeObserver
   * @type MutationObserver
   * @private
   */
  nodeObserver: null,

  /**
   * predicate that verifies whether a node shoud be listed
   * @property isInterestingNode
   * @type Function
   * @public
   */
  isInterestingNode: null,

  /**
   * function that determines the label that should be displayed for a provided node
   * @property labelForNode
   * @type Function
   * @public
   */
  labelForNode: null,

  /**
   * whether the panel is collapsed
   * @property isCollapsed
   * @type boolean
   * @public
   */
  isCollapsed: true,

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
    if (this.get('nodeObserver')) {
      this.get('nodeObserver').disconnect();
    }
  },

  /**
   * filters the dom tree, only maintaining elements that match isInterestingNode
   * @method buildStructure
   * @param {DOMNode} node
   * @return Array
   * @private
   */
  buildStructure(node) {
    let subStructures;
    let domNode;
    if (this.isInterestingNode(node)) {
      domNode = get(node, 'domNode');
      subStructures = get(node, 'children').map(child => this.buildStructure(child)).filter(a => ! isEmpty(a));

      return Object.create({
        node: domNode,
        title: this.labelForNode(domNode),
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
    if (!this.get('isInterestingNode'))
      this.set('isInterestingNode', isInterestingNode);
    if (!this.get('labelForNode'))
      this.set('labelForNode', labelForNode);
  },
  actions: {
    itemClicked(node) {
      forgivingAction('itemClicked',this)(node);
    },
    toggleCollapse() {
      this.toggleProperty('isCollapsed');
    }
  }
});
