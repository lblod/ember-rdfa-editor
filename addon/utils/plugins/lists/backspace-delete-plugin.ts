import {
  BackspaceDeleteHandlerManipulation,
  BackspaceDeletePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-delete-handler';
import { ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ArrayUtils from '@lblod/ember-rdfa-editor/model/util/array-utils';
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
        //check if the li is just at the beginning of the document and adjust the start of the range accordingly

        if (topUl && ArrayUtils.all(range.start.path, (i) => i === 0)) {
          const start = ModelPosition.fromBeforeNode(topUl);
          return {
            allow: true,
            executor: () => {
              editor.executeCommand('remove', new ModelRange(start, range.end));
            },
          };
        }
      }
    }
    return null;
  }
}
