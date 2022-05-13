import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { ElementView } from '@lblod/ember-rdfa-editor/model/node-view';
import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import { LUMP_NODE_PROPERTY } from '../util/constants';

export default class HtmlElementWriter
  implements Writer<ModelElement, ElementView>
{

  write(modelNode: ModelElement): ElementView {
    const result = document.createElement(modelNode.type);

    // This will disable the selection of multiple cells on table.
    // Idea reverse-engineered from readctor.
    if (modelNode.type === 'table') {
      result.contentEditable = 'false';
    }
    if (modelNode.type === 'td' || modelNode.type === 'th') {
      if (parentIsLumpNode(modelNode)) {
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

function parentIsLumpNode(modelNode: ModelElement): boolean {
  while (modelNode.parent) {
    const properties = modelNode.parent.getRdfaAttributes().properties;
    if (properties && properties.includes(LUMP_NODE_PROPERTY)) {
      return true;
    }
    modelNode = modelNode.parent;
  }
  return false;
}
