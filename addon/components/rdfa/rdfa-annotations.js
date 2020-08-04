import Component from '@glimmer/component';
import RdfaContextScanner from '@lblod/marawa/rdfa-context-scanner';
import {tracked} from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
/**
 * @module rdfa-editor
 * @class RdfaAnnotations
 */
export default class RdfaAnnotations extends Component {
  @tracked rdfaBlocks;
  @service resourceMetadata;
  topPositions = {}
  constructor() {
    super(...arguments);
    setTimeout(this.setupObserver.bind(this, 1), 250);
  }
  /*
   * ###########################
   * #   Setting up Observer   #
   * ###########################
  */
  /**
    * Setup the observer to watch for changes in the document
    *
    * @method setupObserver
    *
    * @param {number} callDepth To avoid stack overflow, must be initialised to 0
    *
    * @private
    */
  setupObserver(callDepth) {
    try {
      if(callDepth>100) {
        console.log("Maximum number of retries for setting up the observer, aborting");
        return;
      }
      const editorPaper = document.querySelector('.say-editor__paper');
      const callback = () => {
        this.generateAnnotations.perform();
      };
      const observer = new MutationObserver(callback);
      observer.observe(editorPaper, {
        attributes: true, 
        subtree: true, 
        childList: true, 
        characterData: true,
        attributeFilter: [ 
          'property', 
          'typeof', 
          'data-editor-position-level'
        ]
      });
    } catch(e) {
      setTimeout(this.setupObserver.bind(this, callDepth+1), 250);
      
    }
  }
  /*
   * #########################
   * #   Getting Rdfa Info   #
   * #########################
  */
  /**
    * Generates the rdfaBlocks that will be rendered 
    *
    * @method generateAnnotations
    *
    * @private
    */
  @task({ restartable: true })
  *generateAnnotations(){
    yield timeout(250);
    const cursor = document.querySelector('[data-editor-position-level="0"]');
    const scanner = new RdfaContextScanner();
    const rdfaBlocks = scanner.analyse(cursor);
    this.resetTopPositions();
    if(rdfaBlocks.length) {
      let parentArray = this.getParentArray(rdfaBlocks[0].richNodes[0]);
      parentArray = this.extractLastContext(parentArray);
      parentArray = parentArray.filter((parent) => parent.lastContext);
      parentArray = this.addTopPositions(parentArray);
      parentArray = yield this.queryLabels(parentArray);
      this.rdfaBlocks = parentArray;
    }
  }
  /**
    * Get an array of all the ancestors of the given node
    *
    * @method generateAnnotations
    *
    * @param {RdfaBlock} startNode The first node in order to start generating the parents
    * @private
    * @return {[RdfaBlock]} All the ancestors of the start node
    */
  getParentArray(startNode) {
    const richNodesOnPath = [startNode];

    for(let richNode = startNode.parent; richNode; richNode = richNode.parent) {
      richNodesOnPath.push(richNode);
    }

    richNodesOnPath.reverse(); // get rich nodes from top to bottom

    return richNodesOnPath;
  }
  /**
    * Process the array of nodes and extract the last context of each one and add it as a property to the node
    *
    * @method extractLastContext
    *
    * @param {[RdfaBlock]} nodeArray The array of RdfaBlocks
    * @private
    * @return {[RdfaBlock]} The array of RdfaBlocks with the lastContext extracted
    */
  extractLastContext(nodeArray) {
    return nodeArray.map((node) => {
      if(node.rdfaContext && node.rdfaContext.length) {
        node.lastContext = node.rdfaContext[node.rdfaContext.length-1];
      }
      return node;
    });
  }

  /*
   * #####################################
   * #   Calculating position of hints   #
   * #####################################
  */
  /**
    * Reset the topPositions object
    *
    * @method resetTopPositions
    *
    * @private
    */
  resetTopPositions() {
    this.topPositions = {};
  }
  /**
    * Process the nodeArray and add the top position for each of the nodes
    *
    * @method addTopPositions
    *
    * @param {[RdfaBlock]} nodeArray The array of RdfaBlocks
    * @private
    * @return {[RdfaBlock]} The array of RdfaBlocks with the top positions added
    */
  addTopPositions(nodeArray) {
    return nodeArray.map((node) => {
      if(node.domNode && (node.domNode.offsetTop || node.domNode.offsetTop === 0)) {
        node.hasTopPosition = true;
        let nodeOffset = this.calculateNodeOffset(node.domNode);
        let blockPlacement;
        const navbarAndToolbarOffset = 96 + 44; // Magic numbers for now, they correspond to the height of the navbar and the toolbar
        if(node.lastContext.typeof && node.lastContext.typeof.length && node.lastContext.properties && node.lastContext.properties.length) {
          blockPlacement = this.blockPlacement(nodeOffset - navbarAndToolbarOffset, 2); 
        } else {
          blockPlacement = this.blockPlacement(nodeOffset - navbarAndToolbarOffset);
        }
        node.topPosition = blockPlacement; 
      }
      return node;
    });
  }
  /**
    * Calculate the offset top of a node taking into account all its parents
    *
    * @method calculateNodeOffset
    *
    * @param {RdfaBlock} node The node to calculate the offset
    * @private
    * @return {number} The top offset of the node
    */
  calculateNodeOffset(node) {
    if(node.offsetParent) {
      return node.offsetTop + this.calculateNodeOffset(node.offsetParent);
    }
    return node.offsetTop;
  }
  /**
    * Tries to place a block the closest possible to its original offset so it doesn't collide with other blocks
    *
    * @method blockPlacement
    *
    * @param {number} offset The original offset of the node
    * @param {number} numberOfBlocks The number of blocks that need to be placed
    * @private
    * @return {number} The definitive placement of the block
    */
  blockPlacement(offset, numberOfBlocks = 1) {
    const offsetToNearest20 = Math.round(offset/20)*20;
    if(this.topPositions[offsetToNearest20]) {
      return this.blockPlacement(offsetToNearest20+20, numberOfBlocks);
    } else {
      this.topPositions[offsetToNearest20] = true;
      if(numberOfBlocks == 2) {
        this.topPositions[offsetToNearest20 + 20] = true;
      }
      return offsetToNearest20;
    }
  }

  /*
   * ####################################
   * #   Getting labels for rdfa uris   #
   * ####################################
  */
  /**
    * Replaces each of the uri terms in the RdfaBlock array for its corresponding label
    *
    * @method queryLabels
    *
    * @param {[RdfaBlock]} nodeArray The array of RdfaBlocks
    * @private
    * @return {[RdfaBlock]} The array of RdfaBlocks with the labels added
    */
  async queryLabels(nodeArray) {
    return await Promise.all(nodeArray.map(async (node) => {
      if(node.lastContext.typeof) {
        node.lastContext.typeof[0] = (await this.resourceMetadata.fetch(node.lastContext.typeof[0])).label;
      }
      if(node.lastContext.properties) {
        node.lastContext.properties[0] = (await this.resourceMetadata.fetch( node.lastContext.properties[0])).label;
      }
      return node;
    }));
  }
}
