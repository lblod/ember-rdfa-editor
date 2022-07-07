import {
  BackspaceDeleteHandlerManipulation,
  BackspaceDeletePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-delete-handler';
import { ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import rawEditor from '../../ce/raw-editor';

export class LumpNodeBackspaceDeleteInputPlugin
  implements BackspaceDeletePlugin
{
  label = 'Backspace/Delete plugin for handling lump nodes in a range';
  guidanceForManipulation(
    manipulation: BackspaceDeleteHandlerManipulation,
    editor: rawEditor
  ): ManipulationGuidance | null {
    const { range, direction } = manipulation;
    const lumpNode = GenTreeWalker.fromRange({
      range,
      reverse: direction === -1,
      filter: toFilterSkipFalse(
        (node) =>
          ModelNode.isModelElement(node) && ModelNodeUtils.isLumpNode(node)
      ),
    }).nextNode();
    if (lumpNode) {
      if (lumpNode.getAttribute('data-flagged-remove') !== 'complete') {
        return {
          allow: true,
          executor: () => {
            editor.model.change(() => {
              lumpNode.setAttribute('data-flagged-remove', 'complete');
            });
          },
        };
      }
    }
    return null;
  }
}
