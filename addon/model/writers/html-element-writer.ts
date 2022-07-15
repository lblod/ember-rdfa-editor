import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { ElementView } from '@lblod/ember-rdfa-editor/model/node-view';
import ModelNodeUtils from '../util/model-node-utils';

export default class HtmlElementWriter
  implements Writer<ModelElement, ElementView>
{
  constructor(private model: Model) {}

  write(modelNode: ModelElement): ElementView {
    const result = document.createElement(modelNode.type);
    // This will disable the selection of multiple cells on table.
    // Idea reverse-engineered from readctor.
    if (modelNode.type === 'table') {
      result.contentEditable = 'false';
    }
    if (modelNode.type === 'td' || modelNode.type === 'th') {
      if (ModelNodeUtils.parentIsLumpNode(modelNode)) {
        result.contentEditable = 'false';
      } else {
        result.contentEditable = 'true';
      }
    }

    for (const item of modelNode.attributeMap.entries()) {
      result.setAttribute(item[0], item[1]);
    }

    return { viewRoot: result, contentRoot: result };
  }
}
