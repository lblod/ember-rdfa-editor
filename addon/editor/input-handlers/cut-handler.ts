import HTMLExportWriter from "@lblod/ember-rdfa-editor/model/writers/html-export-writer";
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";

/**
 * @module contenteditable-editor
 * @class CutHandler
 * @constructor
 */
export default class CutHandler {
  rawEditor: PernetRawEditor;

  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    this.rawEditor = rawEditor;
  }

  handleEvent(event: ClipboardEvent): void {
    const htmlExportWriter = new HTMLExportWriter(this.rawEditor.model);
    const modelNodes = this.rawEditor.executeCommand("delete-selection") as ModelNode[];
    console.log(modelNodes);

    // Filter out model nodes that are text related
    const filter = toFilterSkipFalse(node => {
      return ModelNode.isModelText(node) || (ModelNode.isModelElement(node) && node.type === "br");
    });

    let htmlString = "";
    let textString = "";
    for (const modelNode of modelNodes) {
      if (ModelNode.isModelElement(modelNode)) {
        modelNode.parent = null;
        const range = ModelRange.fromAroundNode(modelNode);
        const treeWalker = new ModelTreeWalker({filter, range});

        for (const node of treeWalker) {
          textString += ModelNode.isModelText(node)
            ? node.content
            : "\n";
        }
      } else if (ModelNode.isModelText(modelNode)) {
        textString += modelNode.content;
      }

      const node = htmlExportWriter.write(modelNode);
      htmlString += node instanceof HTMLElement
        ? node.outerHTML
        : node.textContent;
    }

    const clipboardData = event.clipboardData || window.clipboardData;
    clipboardData.setData("text/html", htmlString);
    clipboardData.setData("text/plain", textString);
  }
}
