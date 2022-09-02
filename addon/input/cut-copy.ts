import { CommandName } from '@lblod/ember-rdfa-editor';
import Controller from '../model/controller';
import ModelNode from '../model/model-node';
import GenTreeWalker from '../model/util/gen-tree-walker';
import { toFilterSkipFalse } from '../model/util/model-tree-walker';
import writeExportedHtml from '../model/writers/html-export-writer';

export default function handleCutCopy(
  controller: Controller,
  event: ClipboardEvent,
  deleteSelection: boolean
) {
  controller.perform((tr) => {
    const command: CommandName = deleteSelection
      ? 'deleteSelection'
      : 'readSelection';
    const selectedNodes = tr.commands[command]({});
    let modelNodes: ModelNode[];
    if (selectedNodes) {
      modelNodes = selectedNodes;
    } else {
      console.warn(
        'Select command did not execute properly. Defaulting to empty node array.'
      );
      modelNodes = [];
    }

    // Filter out model nodes that are text related
    const filter = toFilterSkipFalse<ModelNode>((node) => {
      return (
        ModelNode.isModelText(node) ||
        (ModelNode.isModelElement(node) && node.type === 'br')
      );
    });

    let xmlString = '';
    let htmlString = '';
    let textString = '';
    for (const modelNode of modelNodes) {
      if (ModelNode.isModelElement(modelNode)) {
        modelNode.parent = null;
        const treeWalker = GenTreeWalker.fromSubTree({
          root: modelNode,
          filter,
        });

        for (const node of treeWalker.nodes()) {
          textString += ModelNode.isModelText(node) ? node.content : '\n';
        }
      } else if (ModelNode.isModelText(modelNode)) {
        textString += modelNode.content;
      }

      const node = writeExportedHtml(modelNode);
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
    clipboardData.setData('text/html', htmlString);
    clipboardData.setData('text/plain', textString);
    clipboardData.setData('application/xml', xmlString);
  });
}
