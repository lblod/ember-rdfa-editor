import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import HtmlReader from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import Command from "@lblod/ember-rdfa-editor/core/command";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";

export default class InsertHtmlCommand extends Command<[string, ModelRange], void> {
  name = "insert-html";

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, htmlString: string, range: ModelRange | null = this.model.selection.lastRange) {
    if (!range) {
      return;
    }

    const parser = new DOMParser();
    const html = parser.parseFromString(htmlString, "text/html");
    const bodyContent = html.body.childNodes;
    const reader = new HtmlReader(this.model);

    this.model.change(executedBy, mutator => {
      // dom NodeList doesn't have a map method
      const modelNodes: ModelNode[] = [];
      bodyContent.forEach(node => {
        const parsed = reader.read(node);
        if (parsed) {
          modelNodes.push(...parsed);
        }
      });

      const newRange = mutator.insertNodes(range, ...modelNodes);
      this.model.selection.selectRange(newRange);
    });
  }
}
