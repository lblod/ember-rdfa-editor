import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export enum PropertyState {
  enabled = 'enabled',
  disabled = 'disabled',
  unknown = 'unknown'
}
export interface RichSelection {
  domSelection: Selection;
  selection: String,
  attributes: {
    rdfaContexts: String,
    inList: PropertyState,
    bold: PropertyState,
    italic: PropertyState,
  },

}
export default class RichSelectionTracker {
  richSelection : RichSelection;
  constructor() {
    this.richSelection = {
      domSelection: getWindowSelection(),
      selection: 'unknown',
      attributes: {
        rdfaContexts: 'unknown',
        inList: PropertyState.unknown,
        bold: PropertyState.unknown,
        italic: PropertyState.unknown
      }
    };
    this.updateSelection = this.updateSelection.bind(this);
  }
  startTracking() {
    document.addEventListener('selectionchange', this.updateSelection);
  }
  stopTracking() {
    document.removeEventListener('selectionchange', this.updateSelection);
  }
  updateSelection() {
    const currentSelection  = getWindowSelection();
    const isBold : PropertyState = this.calculateIsBold(currentSelection);
    const isItalic : PropertyState = this.calculateIsItalic(currentSelection);
    const isInList : PropertyState = this.calculateIsInList(currentSelection);
    const rdfaSelection = this.caculateRdfaSelection(currentSelection);
    const rdfaContexts = this.calculateRdfaContexts(currentSelection);
    this.richSelection = {
      domSelection: currentSelection,
      selection: rdfaSelection,
      attributes: {
        rdfaContexts,
        inList: isInList,
        bold: isBold,
        italic: isItalic
      }
    };
    const richSelectionUpdatedEvent = new Event('richSelectionUpdated');
    document.dispatchEvent(richSelectionUpdatedEvent);
    }

  calculateIsBold(selection: Selection) : PropertyState {
    if(selection.type === 'Caret') {
      if(selection.anchorNode && selection.anchorNode.parentElement) {
        const parentElement = selection.anchorNode.parentElement;
        const fontWeight : Number = Number(window.getComputedStyle(parentElement).fontWeight);
        return fontWeight > 400 ? PropertyState.enabled : PropertyState.disabled;
      } else {
        return PropertyState.unknown;
      }
    } else {
      const range = selection.getRangeAt(0);
      const nodes = this.getNodesInRange(range);
      const isBold = Number(this.getComputedStyle(nodes[0]).fontWeight) > 400;
      for(let i = 1; i < nodes.length; i++) {
        if(Number(this.getComputedStyle(nodes[i]).fontWeight) > 400 != isBold) {
          return PropertyState.unknown;
        }
      }
      return isBold ? PropertyState.enabled : PropertyState.disabled;
    }
  }
  calculateIsItalic(selection: Selection) : PropertyState {
    if(selection.type === 'Caret') {
      if(selection.anchorNode && selection.anchorNode.parentElement) {
        const parentElement = selection.anchorNode.parentElement;
        const fontWeight : Number = Number(window.getComputedStyle(parentElement).fontWeight);
        return fontWeight > 400 ? PropertyState.enabled : PropertyState.disabled;
      } else {
        return PropertyState.unknown;
      }
    } else {
      const range = selection.getRangeAt(0);
      const nodes = this.getNodesInRange(range);
      const isItalic = this.getComputedStyle(nodes[0]).fontStyle === 'italic';
      for(let i = 1; i < nodes.length; i++) {
        if((this.getComputedStyle(nodes[i]).fontStyle === 'italic') != isItalic) {
          return PropertyState.unknown;
        }
      }
      return isItalic ? PropertyState.enabled : PropertyState.disabled;
    }
  }
  calculateIsInList(selection: Selection) {
    return PropertyState.unknown;
  }
  caculateRdfaSelection(selection: Selection) {
    return 'unknown';
  }
  calculateRdfaContexts(selection: Selection) {
    return 'unknown';
  }
  getNextNode(node: Node) {
    let actualNode : Node | null = node;
    if (actualNode.firstChild) {
      return actualNode.firstChild;
    }
    while (actualNode)
    {
        if (actualNode.nextSibling) {
          return actualNode.nextSibling;
        }
        actualNode = actualNode.parentNode;
    }
    return null;
  }

  getNodesInRange(range: Range){
    const start = range.startContainer;
    const end = range.endContainer;
    const commonAncestor = range.commonAncestorContainer;
    const nodes = [];
    let node;

    // walk parent nodes from start to common ancestor
    for (node = start; node; node = node.parentNode){
      if(node === commonAncestor) {
        break;
      }
      nodes.push(node);
    }
    nodes.reverse();

    // walk children and siblings from start until end is found
    for (node = start; node; node = this.getNextNode(node)){
        nodes.push(node);
        if (node == end)
            break;
    }

    return nodes;
  }
  getComputedStyle(node: Node) {
    if(node.nodeType === Node.TEXT_NODE && node.parentElement) {
      return window.getComputedStyle(node.parentElement);
    } else {
      return window.getComputedStyle(node as Element);
    }
  }
}
