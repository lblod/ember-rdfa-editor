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
    
  }

  calculateIsBold() {
    return 'unknown';
  }
  calculateIsItalic() {
    return 'unknown';
  } 
  calculateIsInList() {
    return 'unknown';
  }
  caculateRdfaSelection() {
    return 'unknown';
  }
  calculateRdfaContexts() {
    return 'unknown';
  }
}