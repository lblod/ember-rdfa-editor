import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import ModelRange from "../model/model-range";

export default class InsertHtmlCommand extends Command {
  name = "insert-html";

  constructor(model: Model) {
    super(model);
  }

  execute(htmlString: string, range: ModelRange | null = this.model.selection.lastRange) {
    if (!range) {
      return;
    }
    const parser = new DOMParser();
    const html = parser.parseFromString(htmlString, "text/html");
    const bodyContent = html.body.childNodes;
    const reader = new HtmlReader(this.model);
    this.model.change(mutator => {
      // dom NodeList doesnt have a map method
      const modelNodes: ModelNode[] = [];
      bodyContent.forEach(node => {
        const parsed = reader.read(node);
        if(parsed) {
          modelNodes.push(parsed);
        }
      });
      const newRange = mutator.insertNodes(range, ...modelNodes);
      this.model.selectRange(newRange);
    });
  }
}
