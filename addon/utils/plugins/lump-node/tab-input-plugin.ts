import {
  Manipulation,
  ManipulationGuidance,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {
  TabHandlerManipulation,
  TabInputPlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import RawEditor from '../../ce/raw-editor';

/**
 *
 * @class LumpNodeTabInputPlugin
 * @module plugin/lump-node
 */
export default class LumpNodeTabInputPlugin implements TabInputPlugin {
  label = 'Tab input plugin for handling lumpNodes';

  isSupportedManipulation(manipulation: Manipulation): boolean {
    return (
      manipulation.type === 'moveCursorToStartOfElement' ||
      manipulation.type === 'moveCursorToEndOfElement'
    );
  }

  guidanceForManipulation(
    manipulation: TabHandlerManipulation,
    editor: RawEditor
  ): ManipulationGuidance | null {
    if (!this.isSupportedManipulation(manipulation)) {
      return null;
    }

    const element = manipulation.node;
    const modelElement = editor.model.viewToModel(element);
    const isElementInLumpNode = ModelNodeUtils.isInLumpNode(modelElement);

    if (
      manipulation.type === 'moveCursorToStartOfElement' &&
      isElementInLumpNode
    ) {
      return {
        allow: true,
        executor: this.jumpOverLumpNode,
      };
    } else if (
      manipulation.type === 'moveCursorToEndOfElement' &&
      isElementInLumpNode
    ) {
      return {
        allow: true,
        executor: this.jumpOverLumpNodeBackwards,
      };
    }

    return null;
  }

  jumpOverLumpNode = (
    manipulation: TabHandlerManipulation,
    editor: RawEditor
  ): void => {
    const node = manipulation.node;
    const modelNode = editor.model.viewToModel(node);
    const element = ModelNodeUtils.getParentLumpNode(modelNode); // We can safely assume this.
    if (!element) {
      throw new Error('No parent lump node found');
    }

    const resultPos = ModelPosition.fromAfterNode(element);

    editor.selection.selectRange(new ModelRange(resultPos, resultPos));
    editor.model.write();
  };

  jumpOverLumpNodeBackwards = (
    manipulation: TabHandlerManipulation,
    editor: RawEditor
  ): void => {
    const node = manipulation.node;
    const modelNode = editor.model.viewToModel(node);
    const element = ModelNodeUtils.getParentLumpNode(modelNode); // We can safely assume this.
    if (!element) {
      throw new Error('No parent lump node found');
    }

    const resultPos = ModelPosition.fromBeforeNode(element);

    editor.selection.selectRange(new ModelRange(resultPos, resultPos));
    editor.model.write();
  };
}
