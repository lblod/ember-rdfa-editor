import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import HtmlReader from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import Command from "@lblod/ember-rdfa-editor/core/command";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";

export default class InsertHtmlCommand extends Command<[string, ModelRange], ModelRange> {
  name = "insert-html";

  execute(executedBy: string, htmlString: string, range: ModelRange = this.model.selection.lastRange): ModelRange {

    const parser = new DOMParser();
    const html = parser.parseFromString(htmlString, "text/html");
    const bodyContent = html.body.childNodes;
    const reader = new HtmlReader();

    let insertedRange: ModelRange;
    this.model.change(executedBy, mutator => {
      // dom NodeList doesn't have a map method
      const modelNodes: ModelNode[] = [];
      bodyContent.forEach(node => {
        const parsed = reader.read(node).rootNodes;
        if (parsed) {
          modelNodes.push(...parsed);
        }
      });

      insertedRange = mutator.insertNodes(range, ...modelNodes);
      this.model.selection.selectRange(insertedRange);
    });
    return insertedRange!;
  }
}
