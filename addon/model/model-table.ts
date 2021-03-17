import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelSelection from "./model-selection";

export default class ModelTable extends ModelElement {

  constructor(rows?: number, columns?: number) {
    super('table');
    // We need a constructor without rows or columns for the reader
    if(!rows || !columns) return;
    const firstRow = new ModelElement('tr');
    for(let i = 0; i< columns; i++) {
      const th = new ModelElement('th');
      firstRow.addChild(th);
    }
    const thead = new ModelElement('thead');
    thead.addChild(firstRow);
    this.addChild(thead);
    const tbody = new ModelElement('tbody');
    this.addChild(tbody);
    if(rows > 1) {
      for(let i = 1; i < rows; i++) {
        const row = new ModelElement('tr');
        for(let j = 0; j < columns; j++) {
          const td = new ModelElement('td');
          row.addChild(td);
        }
        tbody.addChild(row);
      }
    }
    this.className = 'say-table';
  }

  getCell(x: number, y: number) {
    if(y > 0) {
      const tBody = this.children[1] as ModelElement;
      const row = tBody.children[y - 1] as ModelElement;
      if(row) {
        return row.children[x];
      } else {
        return undefined;
      }
    } else {
      const tHead = this.children[0] as ModelElement;
      const headRow = tHead.children[0] as ModelElement;
      return headRow.children[x];
    }
  }

  addRow(index?: number) {
    const tBody = this.children[1] as ModelElement;
    const tHead = this.children[0] as ModelElement;
    const columns = (tHead.children[0] as ModelElement).children.length;
    const row = new ModelElement('tr');
    for(let i = 0; i < columns; i++) {
      const cell = new ModelElement('td');
      row.addChild(cell);
    }
    console.log(row);
    tBody.addChild(row, index);
  }

  addColumn(index?: number) {
    const tBody = this.children[1] as ModelElement;
    const tHead = this.children[0] as ModelElement;
    const firstRow = tHead.children[0] as ModelElement;
    const cell = new ModelElement('th');
    firstRow.addChild(cell, index);
    for(let i = 0; i < tBody.children.length; i++) {
      const row = tBody.children[i] as ModelElement;
      const cell = new ModelElement('th');
      row.addChild(cell, index);
    }
  }

  static getCellIndex(cell: ModelElement) {
    if(cell.type !== 'td' && cell.type !== 'th') throw Error('Cell is not a TD or a TH');
    const row = cell.parent;
    if(!row) throw Error('Table doesn\'t have the expected structure');
    const xIndex = row.getChildIndex(cell);
    const rowParent = row.parent;
    if(!rowParent) throw Error('Table doesn\'t have the expected structure');
    let yIndex;
    if(rowParent.type === 'thead') {
      yIndex = 0;
    } else {
      yIndex = rowParent.getChildIndex(row) + 1;
    }
    return {x: xIndex, y: yIndex};
  }

  static getCellFromSelection(selection: ModelSelection) {
    const commonAncestor = selection.getCommonAncestor();
    if(!commonAncestor) return null;
    const cell = commonAncestor.parentElement.findAncestor((node) => {
      if(node.modelNodeType === 'ELEMENT') {
        const element = node as ModelElement;
        if(element.type === 'th' || element.type === 'td') return true;
      }
      return false;
    }) as ModelElement;
    return cell;
  }

  static getTableFromSelection(selection: ModelSelection) {
    const commonAncestor = selection.getCommonAncestor();
    if(!commonAncestor) return null;
    const table = commonAncestor.parentElement.findAncestor((node) => {
      if(node.modelNodeType === 'ELEMENT') {
        const element = node as ModelElement;
        if(element.type === 'table') return true;
      }
      return false;
    }) as ModelTable;
    return table;
  }
  
}