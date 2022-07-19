import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ListCleaner from '@lblod/ember-rdfa-editor/model/cleaners/list-cleaner';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ArrayUtils from '@lblod/ember-rdfa-editor/model/util/array-utils';
import ModelTreeWalker from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import {
  MisbehavedSelectionError,
  ModelError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelElement from '../model/model-element';
import ModelText from '../model/model-text';
import { PropertyState } from '../model/util/types';
import { INVISIBLE_SPACE } from '../model/util/constants';
import State from '../core/state';

export interface MakeListCommandArgs {
  listType?: 'ul' | 'ol';
  selection?: ModelSelection;
}
/**
 * Command will convert all nodes in the selection to a list, if they are not already in a list.
 */
export default class MakeListCommand
  implements Command<MakeListCommandArgs, void>
{
  name = 'make-list';
  arguments: string[] = ['listType', 'selection'];

  canExecute(
    state: State,
    { selection = state.selection }: MakeListCommandArgs
  ) {
    return (
      !selection.inTableState ||
      selection.inTableState === PropertyState.disabled
    );
  }

  @logExecute
  execute(
    { transaction }: CommandContext,

    {
      listType = 'ul',
      selection = transaction.workingCopy.selection,
    }: MakeListCommandArgs
  ) {
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const range = selection.lastRange.clone();
    const wasCollapsed = range.collapsed;
    const blocks = this.getBlocksFromRange(
      range,
      transaction.workingCopy.document
    );

    const list = new ModelElement(listType);
    for (const block of blocks) {
      const li = new ModelElement('li');
      // TODO: Investigate why we have to clone here and document it.
      li.appendChildren(...block.map((node) => node.clone()));
      list.addChild(li);
    }

    transaction.insertNodes(range, list);
    if (!list.firstChild || !list.lastChild) {
      throw new ModelError('List without list item.');
    }
    const newState = transaction.apply();

    const fullRange = ModelRange.fromInElement(
      newState.document,
      0,
      newState.document.getMaxOffset()
    );
    const cleaner = new ListCleaner();
    cleaner.clean(fullRange, transaction);

    let resultRange;
    if (wasCollapsed) {
      const firstChild = list.firstChild as ModelElement;
      resultRange = ModelRange.fromInElement(
        firstChild,
        0,
        firstChild.getMaxOffset()
      );
    } else {
      const firstChild = list.firstChild as ModelElement;
      const lastChild = list.lastChild as ModelElement;
      const start = ModelPosition.fromInElement(firstChild, 0);
      const end = ModelPosition.fromInElement(
        lastChild,
        lastChild.getMaxOffset()
      );
      resultRange = new ModelRange(start, end);
    }

    transaction.selectRange(resultRange);
  }

  private getBlocksFromRange(
    range: ModelRange,
    documentRoot: ModelElement
  ): ModelNode[][] {
    // Expand range until it is bound by blocks.
    let current: ModelNode | null = range.start.nodeAfter();
    if (!current && !range.start.nodeBefore()?.isBlock) {
      current = range.start.nodeBefore();
    }
    if (current) {
      range.start.parentOffset = current.getOffset();

      while (current?.previousSibling && !current.previousSibling.isBlock) {
        current = current.previousSibling;
        range.start.parentOffset = current.getOffset();
      }

      if (range.start.parentOffset === 0) {
        if (range.start.parent === documentRoot) {
          // Expanded to the start of the root node.
          range.start = ModelPosition.fromInElement(documentRoot, 0);
        } else {
          range.start = ModelPosition.fromInElement(
            range.start.parent.parent!,
            range.start.parent.getOffset()
          );
        }
      }
    }

    current = range.end.nodeBefore();

    if (current) {
      range.end.parentOffset = current.getOffset() + current.offsetSize;
      while (current?.nextSibling && !current.nextSibling.isBlock) {
        current = current.nextSibling;
        range.end.parentOffset = current.getOffset() + current.offsetSize;
      }

      if (range.end.parentOffset === range.end.parent.getMaxOffset()) {
        if (range.end.parent === documentRoot) {
          // Expanded to the end of root node.
          range.end = ModelPosition.fromInElement(
            documentRoot,
            documentRoot.getMaxOffset()
          );
        } else {
          range.end = ModelPosition.fromInElement(
            range.end.parent.parent!,
            range.end.parent.getOffset() + range.end.parent.offsetSize
          );
        }
      }
    }

    const confinedRanges = range.getMinimumConfinedRanges();
    const result: ModelNode[][] = [[]];
    let pos = 0;

    for (const range of confinedRanges) {
      const walker = new ModelTreeWalker({ range, descend: false });
      for (const node of walker) {
        if (ModelNode.isModelElement(node) && node.type === 'br') {
          pos++;
        } else if (node.isBlock) {
          if (result[0].length) {
            pos++;
          }
          ArrayUtils.pushOrCreate(result, pos, node);
          pos++;
        } else if (node.hasVisibleText()) {
          ArrayUtils.pushOrCreate(result, pos, node);
        }
      }
    }
    if (result[0].length === 0) {
      result[0].push(new ModelText(INVISIBLE_SPACE));
    }

    return result;
  }
}
