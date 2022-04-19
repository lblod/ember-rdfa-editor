import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';
import HTMLExportWriter from '@lblod/ember-rdfa-editor/model/writers/html-export-writer';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelTreeWalker, {
  toFilterSkipFalse,
} from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

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
    const modelNodes = this.rawEditor.executeCommand(command) as ModelNode[];

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
        const range = ModelRange.fromAroundNode(modelNode);
        const treeWalker = new ModelTreeWalker({ filter, range });

        for (const node of treeWalker) {
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
