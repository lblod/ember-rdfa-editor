import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export default class ModelTable extends ModelElement {
  constructor(rows: number, columns: number) {
    super('table');
    const firstRow = new ModelElement('tr');
    for(let i = 0; i< columns; i++) {
      const th = new ModelElement('th');
      firstRow.addChild(th);
    }
    const thead = new ModelElement('thead');
    thead.addChild(firstRow);
    this.addChild(thead);
    if(rows > 1) {
      const tbody = new ModelElement('tbody');
      for(let i = 1; i < rows; i++) {
        const row = new ModelElement('tr');
        for(let j = 0; j < columns; j++) {
          const td = new ModelElement('td');
          row.addChild(td);
        }
        tbody.addChild(row);
      }
      this.addChild(tbody);
    }
    this.className = 'say-table';
  }
}