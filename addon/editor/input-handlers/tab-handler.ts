import { InputHandler, InputPlugin } from './input-handler';
import {
  ManipulationGuidance,
  MoveCursorAfterEditorManipulation,
  MoveCursorAfterElementManipulation,
  MoveCursorBeforeEditorManipulation,
  MoveCursorBeforeElementManipulation,
  MoveCursorToEndOfElementManipulation,
  MoveCursorToStartOfElementManipulation,
} from './manipulation';
import { warn } from '@ember/debug';
import {
  isElement,
  isTextNode,
  isVisibleElement,
  isVoidElement,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import LumpNodeTabInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/lump-node/tab-input-plugin';
import ListTabInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/lists/tab-input-plugin';
import TableTabInputPlugin from '@lblod/ember-rdfa-editor/utils/plugins/table/tab-input-plugin';
import { ensureValidTextNodeForCaret } from '@lblod/ember-rdfa-editor/editor/utils';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { Direction } from '@lblod/ember-rdfa-editor/model/util/types';

export type TabHandlerManipulation =
  | MoveCursorBeforeElementManipulation
  | MoveCursorToEndOfElementManipulation
  | MoveCursorBeforeEditorManipulation
  | MoveCursorToStartOfElementManipulation
  | MoveCursorAfterElementManipulation
  | MoveCursorAfterEditorManipulation;

/**
 * Interface for specific plugins.
 */
export interface TabInputPlugin extends InputPlugin {
  /**
   * One-liner explaining what the plugin solves.
   */
  label: string;

  /**
   * Callback executed to see if the plugin allows a certain
   * manipulation and/or if it intends to handle the manipulation
   * itself.
   */
  guidanceForManipulation: (
    manipulation: TabHandlerManipulation,
    editor: RawEditor
  ) => ManipulationGuidance | null;
}

/**
 * Tab Input Handler, a event handler to handle tab input
 *
 * @module contenteditable-editor
 * @class TabInputHandler
 * @constructor
 */
export default class TabInputHandler extends InputHandler {
  plugins: Array<TabInputPlugin>;

  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
    this.plugins = [
      new LumpNodeTabInputPlugin(),
      new ListTabInputPlugin(),
      new TableTabInputPlugin(),
    ];
  }

  isHandlerFor(event: Event): boolean {
    const selection = window.getSelection();

    //TODO: Include shift key here?
    return (
      isKeyDownEvent(event) &&
      event.key === 'Tab' &&
      selection !== null &&
      selection.isCollapsed &&
      this.rawEditor.rootNode.contains(selection.anchorNode)
    );
  }

  handleEvent(event: KeyboardEvent) {
    const manipulation = this.getNextManipulation(event);
    // Check if we can execute it.
    const { mayExecute, dispatchedExecutor } =
      this.checkManipulationByPlugins(manipulation);

    // Error if we're not allowed to execute.
    if (!mayExecute) {
      warn(
        `Not allowed to execute manipulation for ${this.constructor.toString()}`,
        { id: 'tab-input-handler-manipulation-not-allowed' }
      );
      return { allowPropagation: false };
    }

    // Run the manipulation.
    if (dispatchedExecutor) {
      dispatchedExecutor(manipulation, this.rawEditor);
    } else {
      this.handleTab(event);
    }
    return { allowPropagation: false };
  }
  handleTab(event: KeyboardEvent) {
    const selection = this.rawEditor.selection;
    const selRange = selection.lastRange!;
    const pos = selRange.start;

    const direction = event.shiftKey ? Direction.FORWARDS : Direction.BACKWARDS;
    const nextEl = findNextElement(pos, direction);
    let resultPos;
    if (nextEl) {
      // next pos is position inside sibling element
      resultPos = posInside(nextEl, direction);
    } else {
      // next pos is after parent, or inside element sibling of parent
      // if it has one
      const parent = pos.parent;
      resultPos = posNextTo(parent, direction);
      if (resultPos) {
        const parentSib = findNextElement(resultPos, direction);
        if (parentSib) {
          resultPos = posInside(parentSib, direction);
        }
      }
    }
    if (resultPos) {
      const newRange = new ModelRange(resultPos, resultPos);
      this.rawEditor.selection.selectRange(newRange);
      this.rawEditor.model.writeSelection(true);
    } else {
      // cursor at start or end of document, do nothing for now
      console.warn('Cursor should be at end');
    }
  }

  handleNativeManipulation(manipulation: TabHandlerManipulation) {
    /************************ SHIFT TAB ************************/
    if (manipulation.type === 'moveCursorToEndOfElement') {
      const element = manipulation.node;
      let textNode;
      if (element.lastChild && isTextNode(element.lastChild)) {
        textNode = element.lastChild;
      } else {
        textNode = document.createTextNode(INVISIBLE_SPACE);
        element.append(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode);
      this.rawEditor.model.read(true);
      window.getSelection()?.collapse(textNode, textNode.length);
    } else if (manipulation.type == 'moveCursorBeforeElement') {
      const element = manipulation.node;

      let textNode;
      if (element.previousSibling && isTextNode(element.previousSibling)) {
        textNode = element.previousSibling;
      } else {
        textNode = document.createTextNode(INVISIBLE_SPACE);
        element.before(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode);
      this.rawEditor.model.read(true);
      window.getSelection()?.collapse(textNode, textNode.length);
    } else if (manipulation.type === 'moveCursorBeforeEditor') {
      //TODO: this could be moved to a plugin eventually.
      console.warn(
        'editor/tab-handler: handle moveCursorBeforeEditor currently disabled until we are sure what we want here'
      );
      /************************ TAB ************************/
    } else if (manipulation.type === 'moveCursorToStartOfElement') {
      const element = manipulation.node;

      let textNode;
      if (element.firstChild && isTextNode(element.firstChild)) {
        textNode = element.firstChild;
      } else {
        textNode = document.createTextNode(INVISIBLE_SPACE);
        element.prepend(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode);
      this.rawEditor.model.read(true);
      window.getSelection()?.collapse(textNode, 0);
    } else if (manipulation.type === 'moveCursorAfterElement') {
      const element = manipulation.node;

      let textNode;
      if (element.nextSibling && isTextNode(element.nextSibling)) {
        textNode = element.nextSibling;
      } else {
        textNode = document.createTextNode(INVISIBLE_SPACE);
        element.after(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode);
      this.rawEditor.model.read(true);
      window.getSelection()?.collapse(textNode, 0);
    } else if (manipulation.type === 'moveCursorAfterEditor') {
      //TODO: this could be moved to a plugin eventually.
      console.warn(
        'editor/tab-handler: handle moveCursorAfterEditor currently disabled until we are sure what we want here'
      );
      // const element = manipulation.node as HTMLElement;
      // element.blur();
    } else {
      throw new Error('Unsupported manipulation');
    }
  }

  //TODO: Fix end or beginning of editor.
  getNextManipulation(event: KeyboardEvent): TabHandlerManipulation {
    const selection = window.getSelection();
    if (!(selection && selection.isCollapsed)) {
      throw new Error('Selection is required for tab input');
    }

    if (event.shiftKey) {
      return this.helpGetShiftTabNextManipulation(selection);
    } else {
      return this.helpGetTabNextManipulation(selection);
    }
  }

  helpGetShiftTabNextManipulation(
    selection: Selection
  ): TabHandlerManipulation {
    const { anchorNode } = selection;
    if (!(anchorNode && anchorNode.parentElement)) {
      throw new Error('Tab input expected anchorNode and parentElement');
    }

    let nextManipulation: TabHandlerManipulation;
    const parentElement = anchorNode.parentElement;
    //TODO: Assumes anchorNode is not an element.
    if (
      parentElement.firstChild &&
      parentElement.firstChild.isSameNode(anchorNode)
    ) {
      nextManipulation = {
        type: 'moveCursorBeforeElement',
        node: parentElement,
        selection,
      };
    } else {
      const childNodes = Array.from(parentElement.childNodes);
      const offsetAnchorNode = childNodes.indexOf(anchorNode as ChildNode);
      const remainingSiblings = [
        ...childNodes.slice(0, offsetAnchorNode + 1),
      ].reverse();

      const previousElementForCursor = remainingSiblings.find((node) => {
        return (
          !isVoidElement(node) && isElement(node) && isVisibleElement(node)
        );
      });

      if (previousElementForCursor) {
        nextManipulation = {
          type: 'moveCursorToEndOfElement',
          node: previousElementForCursor as HTMLElement,
          selection,
        };
      } else {
        nextManipulation = {
          type: 'moveCursorBeforeElement',
          node: parentElement,
          selection,
        };
      }
    }

    if (
      nextManipulation.type === 'moveCursorBeforeElement' &&
      nextManipulation.node.isSameNode(this.rawEditor.rootNode)
    ) {
      nextManipulation = {
        type: 'moveCursorBeforeEditor',
        node: nextManipulation.node,
      };
    }

    return nextManipulation;
  }

  helpGetTabNextManipulation(selection: Selection): TabHandlerManipulation {
    const { anchorNode } = selection;
    if (!(anchorNode && anchorNode.parentElement)) {
      throw new Error('Tab input expected anchorNode and parentElement');
    }

    let nextManipulation: TabHandlerManipulation;
    const parentElement = anchorNode.parentElement;
    //TODO: Assumes anchorNode is not an element.
    if (
      parentElement.lastChild &&
      parentElement.lastChild.isSameNode(anchorNode)
    ) {
      // case: cursor is inside the lastchild of an element
      // behavior: move the cursor after that element
      nextManipulation = {
        type: 'moveCursorAfterElement',
        node: parentElement,
        selection,
      };
    } else {
      const childNodes = Array.from(parentElement.childNodes);
      const offsetAnchorNode = childNodes.indexOf(anchorNode as ChildNode);
      const remainingSiblings = childNodes.slice(offsetAnchorNode + 1);

      const nextElementForCursor = remainingSiblings.find((node) => {
        return (
          !isVoidElement(node) && isElement(node) && isVisibleElement(node)
        );
      });

      if (nextElementForCursor) {
        // case: cursor is inside another child of an element, and there is a valid element sibling
        // behavior: move cursor inside that sibling
        nextManipulation = {
          type: 'moveCursorToStartOfElement',
          node: nextElementForCursor as HTMLElement,
          selection,
        };
      } else {
        // case: cursor is inside another child, but there are no valid element siblings after cursor
        // behavior: move cursor after parent
        nextManipulation = {
          type: 'moveCursorAfterElement',
          node: parentElement,
          selection,
        };
      }
    }

    if (
      nextManipulation.type === 'moveCursorAfterElement' &&
      nextManipulation.node.isSameNode(this.rawEditor.rootNode)
    ) {
      // case: node we want to move after is the rootnode
      // behavior: move cursor after editor (not implemented, maybe focus next tabstop?)
      nextManipulation = {
        type: 'moveCursorAfterEditor',
        node: nextManipulation.node,
      };
    }

    return nextManipulation;
  }
}

/**
 * Get node in direction from pos
 */
function peekNode(pos: ModelPosition, direction: Direction): ModelNode | null {
  if (direction === Direction.BACKWARDS) {
    return pos.nodeBefore();
  } else {
    return pos.nodeAfter();
  }
}
function isNonLeafElement(node: ModelNode): node is ModelElement {
  return ModelNode.isModelElement(node) && !node.isLeaf;
}
function findNextElement(
  pos: ModelPosition,
  direction: Direction
): ModelElement | null {
  let cur = peekNode(pos, direction);
  while (cur && !isNonLeafElement(cur)) {
    cur = sibling(cur, direction);
  }
  return cur;
}
function sibling(node: ModelNode, direction: Direction): ModelNode | null {
  if (direction === Direction.BACKWARDS) {
    return node.previousSibling;
  } else {
    return node.nextSibling;
  }
}
function posNextTo(
  node: ModelNode,
  direction: Direction
): ModelPosition | null {
  // node is rootnode
  if (!node.parent) {
    return null;
  }
  if (direction === Direction.BACKWARDS) {
    return ModelPosition.fromBeforeNode(node);
  } else {
    return ModelPosition.fromAfterNode(node);
  }
}
function posInside(element: ModelElement, direction: Direction): ModelPosition {
  if (direction === Direction.BACKWARDS) {
    return ModelPosition.fromInElement(element, element.getMaxOffset());
  } else {
    return ModelPosition.fromInElement(element, 0);
  }
}
