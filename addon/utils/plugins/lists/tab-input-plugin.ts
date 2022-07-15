import { ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import {
  TabHandlerManipulation,
  TabInputPlugin,
} from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/model/util/model-node-utils';
import { Direction } from '@lblod/ember-rdfa-editor/model/util/types';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { from, isEmpty, last, first } from 'ix/iterable';
import { filter } from 'ix/iterable/operators';
import { ImpossibleModelStateError } from '../../errors';

/**
 * Current behaviour
 * - case not first or last LI:
 *  - if cursor at at beginning of LI + (shift or shift + tab) indents or unindents
 *  - if cursor not at the end of LI jumps to next or previous LI
 * - else: jumps out of list
 * @class ListTabInputPlugin
 * @module plugin/lists
 */
export default class ListTabInputPlugin implements TabInputPlugin {
  label = 'Tab input plugin for handling List interaction';

  guidanceForManipulation(
    manipulation: TabHandlerManipulation,
    editor: RawEditor
  ): ManipulationGuidance | null {
    const modelNode = editor.model.viewToModelSafe(manipulation.node);
    if (!modelNode) {
      return null;
    }
    const { direction } = manipulation;
    const { selection } = editor;
    if (manipulation.type === 'moveCursorToStartOfElement') {
      if (ModelNodeUtils.isListContainer(modelNode)) {
        return {
          allow: true,
          executor: () => this.jumpIntoList(modelNode, direction, editor),
        };
      }
    } else if (manipulation.type === 'moveCursorToEndOfElement') {
      if (ModelNodeUtils.isListContainer(modelNode)) {
        return {
          allow: true,
          executor: () => this.jumpIntoList(modelNode, direction, editor),
        };
      }
    } else if (
      manipulation.type === 'moveCursorAfterElement' &&
      ModelNodeUtils.isListElement(modelNode)
    ) {
      // Some choices have been made. Let's try to follow more or less the most popular html editor.

      // If cursor at beginning of LI, then do the indent.
      const list = modelNode.parent;
      if (!list) {
        throw new ImpossibleModelStateError('Li element cannot be root');
      }
      const lis = from(list.children).pipe(
        filter(ModelNodeUtils.isListElement)
      );

      const firstLi = first(lis);
      const lastLi = last(lis);

      if (
        selection.lastRange?.start.sameAs(
          ModelPosition.fromInNode(modelNode, 0)
        )
      ) {
        if (firstLi && firstLi.sameAs(modelNode)) {
          return {
            allow: true,
            executor: () => this.jumpToNextLi(modelNode, direction, editor),
          };
        } else {
          return { allow: true, executor: this.indentLiContent };
        }
      } else {
        if (lastLi && lastLi.sameAs(modelNode)) {
          return {
            allow: true,
            executor: () => this.jumpOutOfList(list, direction, editor),
          };
        } else {
          return {
            allow: true,
            executor: () => this.jumpToNextLi(modelNode, direction, editor),
          };
        }
      }
    } else if (
      manipulation.type === 'moveCursorBeforeElement' &&
      ModelNodeUtils.isListElement(modelNode)
    ) {
      // If cursor at beginning of LI, then do the unindent.
      // Note: this might be surprising and we also might want the cursor to be at the end of the LI.
      if (
        selection.lastRange?.start.sameAs(
          ModelPosition.fromInNode(modelNode, 0)
        )
      ) {
        return { allow: true, executor: this.unindentLiContent };
      } else {
        const list = modelNode.parent;
        if (!list) {
          throw new ImpossibleModelStateError('Li element cannot be root');
        }
        const firstLi = list.children.find(ModelNodeUtils.isListElement);

        if (firstLi && firstLi.sameAs(modelNode)) {
          return {
            allow: true,
            executor: () => this.jumpOutOfList(list, direction, editor),
          };
        } else {
          return {
            allow: true,
            executor: () => this.jumpToNextLi(modelNode, direction, editor),
          };
        }
      }
    } else if (
      (manipulation.type === 'moveCursorBeforeElement' ||
        manipulation.type === 'moveCursorAfterElement') &&
      ModelNodeUtils.isListContainer(modelNode)
    ) {
      return {
        allow: true,
        executor: () => this.jumpOutOfList(modelNode, direction, editor),
      };
    }

    return null;
  }

  /**
   * Sets the cursor in the first <li></li>. If list is empty, creates an <li></li>.
   */
  jumpIntoList = (
    list: ModelElement,
    direction: Direction,
    editor: RawEditor
  ): void => {
    const lis = from(list.children).pipe(filter(ModelNodeUtils.isListElement));

    // This branch creates a new LI, but not really sure if we want that.
    if (isEmpty(lis)) {
      editor.executeCommand('insert-newLi', ModelRange.fromInNode(list));
    } else {
      let pos;
      if (direction === Direction.FORWARDS) {
        const li = first(lis)!;
        pos = ModelPosition.fromInNode(li, 0);
      } else {
        const li = last(lis)!;
        pos = ModelPosition.fromInNode(li, li.getMaxOffset());
      }
      setCursorAtPos(pos, editor);
    }
  };

  /**
   * Creates nested list.
   * Note: Depends on list helpers from a long time ago.
   * TODO: Indent means the same as nested list, perhaps rename the action
   */
  indentLiContent = (_: TabHandlerManipulation, editor: RawEditor): void => {
    editor.executeCommand('indent-list');
  };

  /**
   * Merges nested list to parent list.
   * Note: Depends on list helpers from a long time ago.
   * TODO: Indent means the same as merge nested list, perhaps rename the action
   */
  unindentLiContent = (_: TabHandlerManipulation, editor: RawEditor): void => {
    editor.executeCommand('unindent-list');
  };
  jumpToNextLi = (
    fromLi: ModelElement,
    direction: Direction,
    editor: RawEditor
  ) => {
    let cur = ModelNodeUtils.siblingInDirection(fromLi, direction);
    while (cur && !ModelNodeUtils.isListElement(cur)) {
      cur = ModelNodeUtils.siblingInDirection(fromLi, direction);
    }
    if (cur) {
      setCursorAtPos(
        ModelPosition.fromInNode(
          cur,
          direction === Direction.FORWARDS ? 0 : cur.getMaxOffset()
        ),
        editor
      );
    } else {
      this.jumpOutOfList(fromLi.parent!, direction, editor);
    }
  };

  /**
   * Jumps outside of list.
   */
  jumpOutOfList = (
    list: ModelElement,
    direction: Direction,
    editor: RawEditor
  ): void => {
    const sibling = ModelNodeUtils.siblingInDirection(list, direction);
    if (sibling) {
      if (sibling.isLeaf) {
        setCursorAtPos(
          direction === Direction.FORWARDS
            ? ModelPosition.fromBeforeNode(sibling)
            : ModelPosition.fromAfterNode(sibling),
          editor
        );
      } else {
        setCursorAtPos(
          direction === Direction.FORWARDS
            ? ModelPosition.fromInNode(sibling, 0)
            : // SAFETY: non-leaf nodes are currently always elements
              ModelPosition.fromInNode(
                sibling,
                (sibling as ModelElement).getMaxOffset()
              ),
          editor
        );
      }
    } else {
      const insertPos =
        direction === Direction.FORWARDS
          ? ModelPosition.fromBeforeNode(list)
          : ModelPosition.fromAfterNode(list);
      editor.executeCommand(
        'insert-text',
        INVISIBLE_SPACE,
        new ModelRange(insertPos, insertPos)
      );
    }
  };
}

function setCursorAtPos(pos: ModelPosition, editor: RawEditor) {
  editor.selection.selectRange(new ModelRange(pos, pos));
  editor.model.writeSelection(true);
}
