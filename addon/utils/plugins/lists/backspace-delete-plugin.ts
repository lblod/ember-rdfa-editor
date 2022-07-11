import {
  BackspaceDeleteHandlerManipulation,
  BackspaceDeletePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-delete-handler';
import { ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ArrayUtils from '@lblod/ember-rdfa-editor/model/util/array-utils';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import rawEditor from '../../ce/raw-editor';

export class ListBackspaceDeleteInputPlugin implements BackspaceDeletePlugin {
  label = 'Backspace/Delete plugin for handling rdfa in a range';
  guidanceForManipulation(
    manipulation: BackspaceDeleteHandlerManipulation,
    editor: rawEditor
  ): ManipulationGuidance | null {
    const { range, direction } = manipulation;
    if (range.collapsed && direction === -1) {
      const lis = [
        ...range.end.parent.findSelfOrAncestors(ModelNodeUtils.isListElement),
      ] as ModelElement[];
      const highestLi = lis[lis.length - 1];
      if (highestLi) {
        const topUl = highestLi.parent;
        if (topUl) {
          let start = range.start;
          while (start.charactersBefore(1) === INVISIBLE_SPACE)
            start = start.shiftedBy(-1);
          if (topUl && ArrayUtils.all(start.path, (i) => i === 0)) {
            start = ModelPosition.fromBeforeNode(topUl);
            //check if the li is just at the beginning of the document and adjust the start of the range accordingly
            return {
              allow: true,
              executor: () => {
                editor.executeCommand(
                  'remove',
                  new ModelRange(start, range.end)
                );
              },
            };
          }
        }
      }
    }
    const nodeAfter = range.end.nodeAfter();
    if (ModelNode.isModelElement(nodeAfter) && nodeAfter.type === 'li') {
      return {
        allow: true,
        executor: () => {
          editor.executeCommand(
            'remove',
            new ModelRange(range.start, ModelPosition.fromInNode(nodeAfter, 0))
          );
        },
      };
    }
    return null;
  }
}
