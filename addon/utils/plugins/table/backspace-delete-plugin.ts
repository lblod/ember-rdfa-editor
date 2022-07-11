import {
  BackspaceDeleteHandlerManipulation,
  BackspaceDeletePlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-delete-handler';
import { ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import rawEditor from '../../ce/raw-editor';

export class TableBackspaceDeleteInputPlugin implements BackspaceDeletePlugin {
  label = 'Backspace/Delete plugin for handling table cells in a range';
  guidanceForManipulation(
    manipulation: BackspaceDeleteHandlerManipulation,
    editor: rawEditor
  ): ManipulationGuidance | null {
    const { range, direction } = manipulation;
    const startCell =
      range.start.parent.findSelfOrAncestors(ModelNodeUtils.isTableCell).next()
        .value || null;
    const endCell =
      range.end.parent.findSelfOrAncestors(ModelNodeUtils.isTableCell).next()
        .value || null;
    if (!startCell && !endCell) {
      return null;
    }
    if (startCell && endCell && startCell === endCell) {
      return null;
    } else {
      if (direction === 1) {
        return {
          allow: true,
          executor: () => {
            return;
          },
        };
      } else {
        return {
          allow: true,
          executor: () => {
            return;
          },
        };
      }
    }
  }
}
