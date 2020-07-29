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
    this.interval = setInterval(async () => {
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
              node.hasTopPosition = true;
              node.topPosition = this.blockPlacement(node.domNode.offsetTop);
            }
          }
          return node;
        })
        parentArray = parentArray.filter((parent) => parent.lastContext);
        parentArray = await Promise.all(parentArray.map(async (parent) => {
          if(parent.lastContext.typeof) {
            const response = await fetch('/resource-labels/getInfo', {
              method: 'POST',
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({term: parent.lastContext.typeof[0]})
            });
            const json = await response.json();
            parent.lastContext.typeof[0] = json.label;
          }
          if(parent.lastContext.properties) {
            const response = await fetch('/resource-labels/getInfo', {
              method: 'POST',
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({term: parent.lastContext.properties[0]})
            });
            const json = await response.json();
            parent.lastContext.properties[0] = json.label;
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
