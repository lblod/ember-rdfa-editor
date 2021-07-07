import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Model from "@lblod/ember-rdfa-editor/model/model";
import HTMLExportWriter from "@lblod/ember-rdfa-editor/model/writers/html-export-writer";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class CutCommand extends Command {
  name = "cut-command";

  constructor(model: Model) {
    super(model);
  }

  execute(event: ClipboardEvent, selection: ModelSelection = this.model.selection): void {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const htmlExportWriter = new HTMLExportWriter(this.model);
    const commonAncestor = selection.getCommonAncestor().parent;
    const range = selection.lastRange;

    this.model.change(mutator => {
      let contentRange = mutator.splitRangeUntilElements(range, commonAncestor, commonAncestor);
      const treeWalker = new ModelTreeWalker({
        range: contentRange,
        descend: false
      });

      // Check if selection is inside table cell. If this is the case, cut children of said cell.
      // Assumption: if table cell is selected, no other nodes at the same level can be selected.
      let modelNodes: Iterable<ModelNode>;
      const firstModelNode = treeWalker.currentNode;
      if (ModelNode.isModelElement(firstModelNode) && firstModelNode.type === "td") {
        contentRange = ModelRange.fromInNode(firstModelNode, 0, firstModelNode.getMaxOffset());
        modelNodes = firstModelNode.children;
      } else {
        modelNodes = treeWalker;
      }

      let htmlString = "";
      for (const modelNode of modelNodes) {
        const node = htmlExportWriter.write(modelNode);
        if (node instanceof HTMLElement) {
          htmlString += node.outerHTML;
        } else {
          htmlString += node.textContent;
        }
      }

      // TODO: use this line to get clipboardData if we want to support Internet Explorer
      // const clipboardData = event.clipboardData || window.clipboardData;

      event.clipboardData?.setData("text/html", htmlString);
      selection.selectRange(mutator.insertNodes(contentRange));
    });
  }
}
