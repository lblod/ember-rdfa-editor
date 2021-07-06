import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelSelection from "./model-selection";

type TableIndex = {
  x: number,
  y: number
};

export default class ModelTable extends ModelElement {

  constructor(rows?: number, columns?: number) {
    super('table');
    // We need a constructor without rows or columns for the reader
    if(!rows || !columns) return;
    const tbody = new ModelElement('tbody');
    this.addChild(tbody);
    for(let i = 0; i < rows; i++) {
      const row = new ModelElement('tr');
      for(let j = 0; j < columns; j++) {
        const td = new ModelElement('td');
        row.addChild(td);
      }
      tbody.addChild(row);
    }
    this.className = 'say-table';
  }

  getDimensions() {
    const tBody = this.children[0] as ModelElement;
    const y = tBody.children.length;
    const firstRow = tBody.children[0] as ModelElement;
    const x = firstRow.children.length;
    return {x, y};
  }

  getCell(x: number, y: number) {
    const tBody = this.children[0] as ModelElement;
    const row = tBody.children[y] as ModelElement;
    if(row) {
      return row.children[x];
    } else {
      return undefined;
    }
  }

  addRow(index?: number) {
    const tBody = this.children[0] as ModelElement;
    const columns = (tBody.children[0] as ModelElement).children.length;
    const row = new ModelElement('tr');
    for(let i = 0; i < columns; i++) {
      const cell = new ModelElement('td');
      row.addChild(cell);
    }
    tBody.addChild(row, index);
  }

  addColumn(index?: number) {
    const tBody = this.children[0] as ModelElement;
    for(let i = 0; i < tBody.children.length; i++) {
      const row = tBody.children[i] as ModelElement;
      const cell = new ModelElement('td');
      row.addChild(cell, index);
    }
  }

  removeRow(index: number) {
    const tBody = this.children[0] as ModelElement;
    const rowToRemove = tBody.children[index];
    tBody.removeChild(rowToRemove);
  }

  removeColumn(index: number) {
    const tBody = this.children[0] as ModelElement;
    for(let i = 0; i < tBody.children.length; i++) {
      const row = tBody.children[i] as ModelElement;
      const cellToDelete = row.children[index];
      row.removeChild(cellToDelete);
    }
  }

  removeTable() {
    this.parent?.removeChild(this);
  }

  static getCellIndex(cell: ModelElement) : TableIndex {
    if(cell.type !== 'td') throw Error('Cell is not a TD');
    const row = cell.parent;
    if(!row) throw Error('Table doesn\'t have the expected structure');
    const xIndex = row.getChildIndex(cell) as number;
    const rowParent = row.parent;
    if(!rowParent) throw Error('Table doesn\'t have the expected structure');
    const yIndex = rowParent.getChildIndex(row) as number;
    return {x: xIndex, y: yIndex};
  }

  static getCellFromSelection(selection: ModelSelection) {
    const generator = selection.lastRange?.findCommonAncestorsWhere((node) => {
      return this.isModelElement(node) && node.type === "td";
    });

    return generator?.next().value;
  }

  static getTableFromSelection(selection: ModelSelection) {
    const generator = selection.lastRange?.findCommonAncestorsWhere((node) => {
      return node instanceof ModelTable;
    });

    return generator?.next().value as ModelTable;
  }
}
