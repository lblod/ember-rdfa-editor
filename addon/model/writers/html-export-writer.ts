import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { WriterError } from '@lblod/ember-rdfa-editor/utils/errors';
import UnpollutedHtmlElementWriter from './unpolluted-html-element-writer';
import UnpollutedHtmlTextWriter from './unpolluted-html-text-writer';
import UnpollutedHtmlInlineComponentWriter from './unpolluted-html-inline-component-writer';

export default class HTMLExportWriter implements Writer<ModelNode, Node> {
  private htmlTextWriter: UnpollutedHtmlTextWriter;
  private htmlElementWriter: UnpollutedHtmlElementWriter;
  private htmlInlineComponentWriter: UnpollutedHtmlInlineComponentWriter;
  constructor(private model: Model) {
    this.htmlTextWriter = new UnpollutedHtmlTextWriter(model);
    this.htmlElementWriter = new UnpollutedHtmlElementWriter(model);
    this.htmlInlineComponentWriter = new UnpollutedHtmlInlineComponentWriter(
      model
    );
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
      //do stuff
      let child: Node | undefined;
      if (modelNode.children.length) {
        child = this.write(modelNode.children[0]);
      }
      result = this.htmlInlineComponentWriter.write(modelNode, child);
    } else {
      throw new WriterError('Unsupported node type');
    }

    if (!result) {
      result = new Text();
    }

    return result;
  }
}
