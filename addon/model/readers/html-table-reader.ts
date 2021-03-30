import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import Model from "@lblod/ember-rdfa-editor/model/model";

export default class HtmlTableReader implements Reader<HTMLElement, ModelElement> {
  read(from: HTMLTableElement): ModelTable {
    const table = new ModelTable();
    for (const attr of from.attributes) {
      table.setAttribute(attr.name, attr.value);
    }
    return table;
  }

}
