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
import PernetRawEditor from '@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor';
import { isKeyDownEvent } from '@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers';

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

  constructor({ rawEditor }: { rawEditor: PernetRawEditor }) {
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
      // NOTE: We should pass some sort of editor interface here in the future.
      dispatchedExecutor(manipulation, this.rawEditor);
    } else {
      this.handleNativeManipulation(manipulation);
    }

    return { allowPropagation: false };
  }

  handleNativeManipulation(manipulation: TabHandlerManipulation) {
    /************************ SHIFT TAB ************************/
    if (manipulation.type === 'moveCursorToEndOfElement') {
      const element = manipulation.node;

      let textNode;
      if (element.lastChild && isTextNode(element.lastChild)) {
        textNode = element.lastChild;
      } else {
        textNode = document.createTextNode('');
        element.append(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, textNode.length);
    } else if (manipulation.type == 'moveCursorBeforeElement') {
      const element = manipulation.node;

      let textNode;
      if (element.previousSibling && isTextNode(element.previousSibling)) {
        textNode = element.previousSibling;
      } else {
        textNode = document.createTextNode('');
        element.before(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, textNode.length);
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
        textNode = document.createTextNode('');
        element.prepend(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, 0);
    } else if (manipulation.type === 'moveCursorAfterElement') {
      const element = manipulation.node;

      let textNode;
      if (element.nextSibling && isTextNode(element.nextSibling)) {
        textNode = element.nextSibling;
      } else {
        textNode = document.createTextNode('');
        element.after(textNode);
      }

      textNode = ensureValidTextNodeForCaret(textNode);
      this.rawEditor.updateRichNode();
      this.rawEditor.setCaret(textNode, 0);
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
        nextManipulation = {
          type: 'moveCursorToStartOfElement',
          node: nextElementForCursor as HTMLElement,
          selection,
        };
      } else {
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
      nextManipulation = {
        type: 'moveCursorAfterEditor',
        node: nextManipulation.node,
      };
    }

    return nextManipulation;
  }
}
