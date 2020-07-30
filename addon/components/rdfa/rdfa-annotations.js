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
      this.resetTopPositions()
      if(rdfaBlocks.length) {
        let parentArray = this.getParentArray(rdfaBlocks[0].richNodes[0]);
        parentArray = parentArray.map((node) => {
          
          if(node.rdfaContext && node.rdfaContext.length) {
            node.lastContext = node.rdfaContext[node.rdfaContext.length-1]
            if(node.domNode && (node.domNode.offsetTop || node.domNode.offsetTop === 0)) {
              node.hasTopPosition = true;
              console.log(this.calculateNodeOffset(node.domNode));
              node.topPosition = this.blockPlacement(this.calculateNodeOffset(node.domNode) - 96 - 44); // Magic numbers for now, they correspond to the height of the navbar and the toolbar
            }
          }
          return node;
        });
        parentArray = parentArray.filter((parent) => parent.lastContext);
        parentArray = await Promise.all(parentArray.map(async (parent) => {
          if(parent.lastContext.typeof) {
            parent.lastContext.typeof[0] = (await this.resourceMetadata.fetch(parent.lastContext.typeof[0])).label;
          }
          if(parent.lastContext.properties) {
            parent.lastContext.properties[0] = (await this.resourceMetadata.fetch( parent.lastContext.properties[0])).label;
          }
          return parent;
        }));
        console.log(parentArray);
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
  blockPlacement(offset) {
    const offsetToNearest20 = Math.round(offset/20)*20;
    if(this.topPositions[offsetToNearest20]) {
      return this.blockPlacement(offsetToNearest20+20);
    } else {
      this.topPositions[offsetToNearest20] = true;
      return offsetToNearest20;
    }
  }
  calculateNodeOffset(node) {
    console.log(node);
    if(node.offsetParent) {
      return node.offsetTop + this.calculateNodeOffset(node.offsetParent);
    }
    return node.offsetTop;
  }
}
