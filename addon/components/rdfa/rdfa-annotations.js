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
  getParentArray(startNode) {
    const richNodesOnPath = [startNode];

    for(let richNode = startNode.parent; richNode; richNode = richNode.parent) {
      richNodesOnPath.push(richNode);
    }

    richNodesOnPath.reverse(); // get rich nodes from top to bottom

    return richNodesOnPath;
  }
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
  resetTopPositions() {
    this.topPositions = {};
  }
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
  calculateNodeOffset(node) {
    if(node.offsetParent) {
      return node.offsetTop + this.calculateNodeOffset(node.offsetParent);
    }
    return node.offsetTop;
  }
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
