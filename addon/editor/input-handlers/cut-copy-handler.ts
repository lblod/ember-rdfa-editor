import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import HTMLExportWriter from '@lblod/ember-rdfa-editor/model/writers/html-export-writer';

export default abstract class CutCopyHandler extends InputHandler {
  abstract deleteSelection: boolean;

  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
  }

  isHandlerFor(event: ClipboardEvent): boolean {
    return !!event.clipboardData;
  }

  handleEvent(event: ClipboardEvent): HandlerResponse {
    const htmlExportWriter = new HTMLExportWriter(this.rawEditor.model);
    const command = this.deleteSelection
      ? 'delete-selection'
      : 'read-selection';
    const selectedNodes = this.rawEditor.executeCommand(command);
    let modelNodes: ModelNode[];
    if (selectedNodes) {
      modelNodes = selectedNodes as ModelNode[];
    } else {
      console.warn(
        'Select command did not execute properly. Defaulting to empty node array.'
      );
      modelNodes = [];
    }

    // Filter out model nodes that are text related
    const filter = toFilterSkipFalse((node) => {
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

      const node = htmlExportWriter.write(modelNode);
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

    return { allowPropagation: false, allowBrowserDefault: false };
  }
}
