import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import Writer from "@lblod/ember-rdfa-editor/core/writers/writer";

export function putDataInClipboard(event: ClipboardEvent, modelNodes: ModelNode[], writer: Writer<ModelNode, Node>) {

  // Filter out model nodes that are text related
  const filter = toFilterSkipFalse(node => {
    return ModelNode.isModelText(node) || (ModelNode.isModelElement(node) && node.type === "br");
  });

  let xmlString = "";
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

    const node = writer.write(modelNode);
    if (node instanceof HTMLElement) {
      xmlString += node.outerHTML;
      htmlString += node.outerHTML;
    } else {
      if (node.textContent) {
        xmlString += `<text>${node.textContent}</text>`;
        htmlString += node.textContent;
      }
    }
  }

  const clipboardData = event.clipboardData || window.clipboardData;
  clipboardData.setData("text/html", htmlString);
  clipboardData.setData("text/plain", textString);
  clipboardData.setData("application/xml", xmlString);
}
