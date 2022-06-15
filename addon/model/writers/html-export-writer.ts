import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { WriterError } from '@lblod/ember-rdfa-editor/utils/errors';
import UnpollutedHtmlElementWriter from './unpolluted-html-element-writer';
import UnpollutedHtmlTextWriter from './unpolluted-html-text-writer';
import UnpollutedHtmlInlineComponentWriter from './unpolluted-html-inline-component-writer';

export default class HTMLExportWriter {
  private htmlTextWriter: UnpollutedHtmlTextWriter;
  private htmlElementWriter: UnpollutedHtmlElementWriter;
  private htmlInlineComponentWriter: UnpollutedHtmlInlineComponentWriter;
  constructor() {
    this.htmlTextWriter = new UnpollutedHtmlTextWriter();
    this.htmlElementWriter = new UnpollutedHtmlElementWriter();
    this.htmlInlineComponentWriter = new UnpollutedHtmlInlineComponentWriter();
  }

  write(modelNode: ModelNode): Node {
    let result = null;

    if (ModelNode.isModelElement(modelNode)) {
      result = this.htmlElementWriter.write(modelNode);
      for (const child of modelNode.children) {
        result.appendChild(this.write(child));
      }
    } else if (ModelNode.isModelText(modelNode)) {
      result = this.htmlTextWriter.write(modelNode);
    } else if (ModelNode.isModelInlineComponent(modelNode)) {
      result = this.htmlInlineComponentWriter.write(modelNode);
    } else {
      throw new WriterError('Unsupported node type');
    }

    if (!result) {
      result = new Text();
    }

    return result;
  }
}
