import {
  BackspaceDeleteHandlerManipulation,
  BackspaceDeletePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-delete-handler';
import { ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ArrayUtils from '@lblod/ember-rdfa-editor/model/util/array-utils';
import GenTreeWalker from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import rawEditor from '../../ce/raw-editor';

export class RdfaBackspaceDeleteInputPlugin implements BackspaceDeletePlugin {
  label = 'Backspace/Delete plugin for handling rdfa in a range';
  guidanceForManipulation(
    manipulation: BackspaceDeleteHandlerManipulation,
    editor: rawEditor
  ): ManipulationGuidance | null {
    const walker = GenTreeWalker.fromRange({
      range: manipulation.range,
      reverse: manipulation.direction === -1,
    });
    const nodes = [...walker.nodes()];
    if (
      ArrayUtils.all(
        nodes,
        (node) =>
          ModelNode.isModelElement(node) && !node.getRdfaAttributes().isEmpty
      ) &&
      nodes.length
    ) {
      const executor = () => {
        editor.model.change(() => {
          editor.model.selectRange(
            new ModelRange(
              manipulation.direction === -1
                ? manipulation.range.start
                : manipulation.range.end
            )
          );
        });
      };
      return { allow: true, executor };
    }
    return null;
  }
}
