import classic from "ember-classic-decorator";
import { action } from "@ember/object";
import { layout as templateLayout } from "@ember-decorators/component";
import Component from '@glimmer/component';
import layout from '../../templates/components/rdfa/editor-suggested-hints';
import { A } from '@ember/array';
import RdfaContextScanner from '@lblod/marawa/rdfa-context-scanner';
import {tracked} from '@glimmer/tracking'
/**
 * @module rdfa-editor
 * @class RdfaEditorSuggestedHintsComponent
 */
export default class EditorSuggestedHints extends Component {
  @tracked rdfaBlocks
  topPositions = {}
  constructor() {
    super(...arguments);
    this.interval = setInterval(() => {
      const cursor = document.querySelector('[data-editor-position-level="0"]');
      const scanner = new RdfaContextScanner();
      const rdfaBlocks = scanner.analyse(cursor)
      this.resetTopPositions()
      if(rdfaBlocks.length) {
        let parentArray = this.getParentArray(rdfaBlocks[0].richNodes[0])
        parentArray = parentArray.map((node) => {
          
          if(node.rdfaContext && node.rdfaContext.length) {
            node.lastContext = node.rdfaContext[node.rdfaContext.length-1]
            if(node.domNode && (node.domNode.offsetTop || node.domNode.offsetTop === 0)) {
              node.topPosition = this.blockPlacement(node.domNode.offsetTop);
              console.log(node.topPosition)
            }
          }
          return node
        })
        parentArray = parentArray.filter((parent) => parent.lastContext)
        console.log(parentArray)
        this.rdfaBlocks = parentArray
      }
    }, 5000);
  }
  getParentArray(startNode) {
    const richNodesOnPath = [startNode];

    for(let richNode = startNode.parent; richNode; richNode = richNode.parent) {
      richNodesOnPath.push(richNode);
    }

    richNodesOnPath.reverse(); // get rich nodes from top to bottom

    return richNodesOnPath
  }
  resetTopPositions() {
    this.topPositions = {}
  }
  blockPlacement(offset) {
    const offsetToNearest80 = Math.round(offset/80)*80
    if(this.topPositions[offsetToNearest80]) {
      return this.blockPlacement(offsetToNearest80+80)
    } else {
      this.topPositions[offsetToNearest80] = true;
      return offsetToNearest80
    }
  }
}
