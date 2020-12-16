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
    console.log(this.richSelection);
  }

  calculateIsBold(selection) {
    if(selection.type === 'Caret') {
      const parentElement = selection.baseNode.parentElement;
      const fontWeight = window.getComputedStyle(parentElement).fontWeight;
      return fontWeight > 400;
    } else {
      return 'unknown';
      const range = selection.getRangeAt(0);
      const nodes = this.getNodesInRange(range);
      let isBold = window.getComputedStyle(nodes[0]).fontWeight > 400;
      for(let i = 1; i < nodes.length) {
        if(window.getComputedStyle(nodes[0]).fontWeight > 400 != isBold) {
          return 'unknown'
        }
      }
      return isBold;
    }
  }
  calculateIsItalic(selection) {
    if(selection.type === 'Caret') {
      const parentElement = selection.baseNode.parentElement;
      const fontStyle = window.getComputedStyle(parentElement).fontStyle;
      return fontStyle === 'italic';
    } else {
      return 'unknown';
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
    for (node = start.parentNode; node; node = node.parentNode){
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
}