import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ListCleaner from '@lblod/ember-rdfa-editor/utils/list-cleaner';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/array-utils';
import ModelTreeWalker from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import {
  MisbehavedSelectionError,
  ModelError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelElement from '../core/model/nodes/model-element';
import ModelText from '../core/model/nodes/model-text';
import { PropertyState } from '../utils/types';
import { INVISIBLE_SPACE } from '../utils/constants';
import GenTreeWalker from '../utils/gen-tree-walker';
import State from '../core/state';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    makeList: MakeListCommand;
  }
}

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
    const blocks = this.getBlocksFromRange(range, transaction.currentDocument);

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

    const fullRange = ModelRange.fromInElement(
      transaction.currentDocument,
      transaction.currentDocument,
      0,
      transaction.currentDocument.getMaxOffset()
    );
    const cleaner = new ListCleaner();
    cleaner.clean(fullRange, transaction);
  }

  private getBlocksFromRange(
    range: ModelRange,
    documentRoot: ModelElement
  ): ModelNode[][] {
    // Expand range until it is bound by blocks.
    let walker = GenTreeWalker.fromRange({
      range: new ModelRange(
        ModelPosition.fromInNode(documentRoot, range.root, 0),
        range.start
      ),
      reverse: true,
    });
    let nextNode = walker.nextNode();
    while (nextNode && !nextNode.isBlock) {
      range.start = ModelPosition.fromInNode(documentRoot, nextNode, 0);
      nextNode = walker.nextNode();
    }

    if (range.start.parentOffset === 0) {
      if (range.start.parent === documentRoot) {
        // Expanded to the start of the root node.
        range.start = ModelPosition.fromInElement(
          documentRoot,
          documentRoot,
          0
        );
      } else {
        range.start = ModelPosition.fromInElement(
          documentRoot,
          range.start.parent.getParent(documentRoot)!,
          range.start.parent.getOffset()
        );
      }
    }

    walker = GenTreeWalker.fromRange({
      range: new ModelRange(
        range.end,
        ModelPosition.fromInNode(
          documentRoot,
          range.root,
          range.root.getMaxOffset()
        )
      ),
    });
    nextNode = walker.nextNode();
    while (nextNode && !nextNode.isBlock) {
      range.end = ModelPosition.fromAfterNode(documentRoot, nextNode);
      nextNode = walker.nextNode();
    }

    if (range.end.parentOffset === range.end.parent.getMaxOffset()) {
      if (range.end.parent === documentRoot) {
        // Expanded to the end of root node.
        range.end = ModelPosition.fromInElement(
          documentRoot,
          documentRoot,
          documentRoot.getMaxOffset()
        );
      } else {
        range.end = ModelPosition.fromInElement(
          documentRoot,
          range.end.parent.getParent(documentRoot)!,
          range.end.parent.getOffset() + range.end.parent.offsetSize
        );
      }
    }
    // }

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
