export default class RichSelectionTracker {
  richSelection;
  constructor() {
    this.richSelection = {};
    this.updateSelection = this.updateSelection.bind(this);
  }
  startTracking() {
    document.addEventListener('selectionchange', this.updateSelection);
  } 
  stopTracking() {
    document.removeEventListener('selectionchange', this.updateSelection);
  }
  updateSelection() {
    const currentSelection = document.getSelection();
    const isBold = this.calculateIsBold(currentSelection);
    const isItalic = this.calculateIsItalic(currentSelection);
    const isInList = this.calculateIsInList(currentSelection);
    const rdfaSelection = this.caculateRdfaSelection(currentSelection);
    const rdfaContexts = this.calculateRdfaContexts(currentSelection);
    this.richSelection = {
      selection: rdfaSelection,
      attributes: {
        rdfaContexts,
        inList: isInList,
        bold: isBold,
        italic: isItalic
      }
    };
    const richSelectionUpdatedEvent = new Event('richSelectionUpdated');
    console.log(this.richSelection);
    document.dispatchEvent(richSelectionUpdatedEvent);
  }

  calculateIsBold(selection) {
    if(selection.type === 'Caret') {
      const parentElement = selection.anchorNode.parentElement;
      const fontWeight = window.getComputedStyle(parentElement).fontWeight;
      return fontWeight > 400;
    } else {
      const range = selection.getRangeAt(0);
      const nodes = this.getNodesInRange(range);
      let isBold = this.getComputedStyle(nodes[0]).fontWeight > 400;
      for(let i = 1; i < nodes.length; i++) {
        if(this.getComputedStyle(nodes[i]).fontWeight > 400 != isBold) {
          return 'unknown';
        }
      }
      return isBold;
    }
  }
  calculateIsItalic(selection) {
    if(selection.type === 'Caret') {
      const parentElement = selection.baseNode.parentElement;
      const fontStyle = this.getComputedStyle(parentElement).fontStyle;
      return fontStyle === 'italic';
    } else {
      const range = selection.getRangeAt(0);
      const nodes = this.getNodesInRange(range);
      let isItalic = this.getComputedStyle(nodes[0]).fontStyle === 'italic';
      for(let i = 1; i < nodes.length; i++) {
        if((this.getComputedStyle(nodes[i]).fontStyle === 'italic') != isItalic) {
          return 'unknown';
        }
      }
      return isItalic;
    }
  } 
  calculateIsInList(selection) {
    return 'unknown';
  }
  caculateRdfaSelection(selection) {
    return 'unknown';
  }
  calculateRdfaContexts(selection) {
    return 'unknown';
  }
  getNextNode(node) {
    if (node.firstChild)
        return node.firstChild;
    while (node)
    {
        if (node.nextSibling)
            return node.nextSibling;
        node = node.parentNode;
    }
  }

  getNodesInRange(range){
    var start = range.startContainer;
    var end = range.endContainer;
    var commonAncestor = range.commonAncestorContainer;
    var nodes = [];
    var node;

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
  getComputedStyle(node) {
    if(node.nodeType === Node.TEXT_NODE) {
      return window.getComputedStyle(node.parentElement);
    } else {
      return window.getComputedStyle(node);
    }
  }
}