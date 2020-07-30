import Component from '@glimmer/component';
import RdfaContextScanner from '@lblod/marawa/rdfa-context-scanner';
import {tracked} from '@glimmer/tracking';
import { inject as service } from '@ember/service';
/**
 * @module rdfa-editor
 * @class RdfaEditorSuggestedHintsComponent
 */
export default class EditorSuggestedHints extends Component {
  @tracked rdfaBlocks;
  @service resourceMetadata;
  topPositions = {}
  constructor() {
    super(...arguments);
    this.interval = setInterval(async () => {
      const cursor = document.querySelector('[data-editor-position-level="0"]');
      const scanner = new RdfaContextScanner();
      const rdfaBlocks = scanner.analyse(cursor);
      this.resetTopPositions();
      if(rdfaBlocks.length) {
        let parentArray = this.getParentArray(rdfaBlocks[0].richNodes[0]);
        parentArray = this.extractLastContext(parentArray);
        parentArray = parentArray.filter((parent) => parent.lastContext);
        parentArray = this.addTopPositions(parentArray);
        parentArray = await this.queryLabels(parentArray);
        this.rdfaBlocks = parentArray;
      }
    }, 5000);
  }
  getParentArray(startNode) {
    const richNodesOnPath = [startNode];

    for(let richNode = startNode.parent; richNode; richNode = richNode.parent) {
      richNodesOnPath.push(richNode);
    }

    richNodesOnPath.reverse(); // get rich nodes from top to bottom

    return richNodesOnPath;
  }
  resetTopPositions() {
    this.topPositions = {};
  }
  extractLastContext(nodeArray) {
    return nodeArray.map((node) => {
      if(node.rdfaContext && node.rdfaContext.length) {
        node.lastContext = node.rdfaContext[node.rdfaContext.length-1];
      }
    });
  }
  addTopPositions(nodeArray) {
    return nodeArray.map((node) => {
      if(node.domNode && (node.domNode.offsetTop || node.domNode.offsetTop === 0)) {
        node.hasTopPosition = true;
        node.topPosition = this.blockPlacement(this.calculateNodeOffset(node.domNode) - 96 - 44); // Magic numbers for now, they correspond to the height of the navbar and the toolbar
      }
    });
  }
  calculateNodeOffset(node) {
    if(node.offsetParent) {
      return node.offsetTop + this.calculateNodeOffset(node.offsetParent);
    }
    return node.offsetTop;
  }
  blockPlacement(offset) {
    const offsetToNearest20 = Math.round(offset/20)*20;
    if(this.topPositions[offsetToNearest20]) {
      return this.blockPlacement(offsetToNearest20+20);
    } else {
      this.topPositions[offsetToNearest20] = true;
      return offsetToNearest20;
    }
  }
  async queryLabels(nodeArray) {
    await Promise.all(nodeArray.map(async (node) => {
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
