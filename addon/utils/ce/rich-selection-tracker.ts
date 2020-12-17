import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import { isInList } from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';

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
    underline: PropertyState,
    strikethrough: PropertyState
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
        italic: PropertyState.unknown,
        underline: PropertyState.unknown,
        strikethrough: PropertyState.unknown
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
    const isUnderline : PropertyState = this.calculateIsUnderline(currentSelection);
      const isStriketrough : PropertyState = this.calculateIsStriketrough(currentSelection);
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
        italic: isItalic,
          underline: isUnderline,
          strikethrough: isStriketrough
      }
    };
    const richSelectionUpdatedEvent = new CustomEvent<RichSelection>('richSelectionUpdated', {detail:  this.richSelection});
    document.dispatchEvent(richSelectionUpdatedEvent);
    }

  calculateIsBold(selection: Selection) : PropertyState {
    if(selection.type === 'Caret') {
      if(selection.anchorNode && selection.anchorNode.parentElement) {
        const parentElement = selection.anchorNode.parentElement;
        const fontWeight : Number = Number(this.getComputedStyle(parentElement).fontWeight);
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
        const isItalic : Boolean = this.getComputedStyle(parentElement).fontStyle === 'italic';
        return isItalic ? PropertyState.enabled : PropertyState.disabled;
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
  calculateIsUnderline(selection: Selection) : PropertyState {
    if(selection.type === 'Caret') {
      if(selection.anchorNode && selection.anchorNode.parentElement) {
        const parentElement = selection.anchorNode.parentElement;
        const isUnderline : Boolean = this.getComputedStyle(parentElement).textDecoration === 'underline';
        return isUnderline ? PropertyState.enabled : PropertyState.disabled;
      } else {
        return PropertyState.unknown;
      }
    } else {
      const range = selection.getRangeAt(0);
      const nodes = this.getNodesInRange(range);
      const isUnderline = this.getComputedStyle(nodes[0]).textDecoration === 'underline';
      for(let i = 1; i < nodes.length; i++) {
        if((this.getComputedStyle(nodes[i]).textDecoration === 'underline') != isUnderline) {
          return PropertyState.unknown;
        }
      }
      return isUnderline ? PropertyState.enabled : PropertyState.disabled;
    }
  }
  calculateIsStriketrough(selection: Selection) : PropertyState {
    if(selection.type === 'Caret') {
      if(selection.anchorNode && selection.anchorNode.parentElement) {
        const parentElement = selection.anchorNode.parentElement;
        const isStriketrough : Boolean = this.getComputedStyle(parentElement).textDecoration === 'line-through';
        return isStriketrough ? PropertyState.enabled : PropertyState.disabled;
      } else {
        return PropertyState.unknown;
      }
    } else {
      const range = selection.getRangeAt(0);
      const nodes = this.getNodesInRange(range);
      const isStriketrough = this.getComputedStyle(nodes[0]).textDecoration === 'line-through';
      for(let i = 1; i < nodes.length; i++) {
        if((this.getComputedStyle(nodes[i]).textDecoration === 'line-through') != isStriketrough) {
          return PropertyState.unknown;
        }
      }
      return isStriketrough ? PropertyState.enabled : PropertyState.disabled;
    }
  }
  calculateIsInList(selection: Selection) {
    if(selection.type === 'Caret') {
      if(selection.anchorNode) {
        const inList : Boolean = isInList(selection.anchorNode);
        return inList ? PropertyState.enabled : PropertyState.disabled;
      } else {
        return PropertyState.unknown;
      }
    } else {
      const range = selection.getRangeAt(0);
      const nodes = this.getNodesInRange(range);
      const inList = isInList(nodes[0]);
      for(let i = 1; i < nodes.length; i++) {
        if((isInList(nodes[i])) != inList) {
          return PropertyState.unknown;
        }
      }
      return inList ? PropertyState.enabled : PropertyState.disabled;
    }
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

