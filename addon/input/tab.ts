import { warn } from '@ember/debug';
import { Editor } from '../core/editor';
import { TabHandlerManipulation } from '../editor/input-handlers/tab-handler';
import { ensureValidTextNodeForCaret } from '../editor/utils';
import {
  isElement,
  isTextNode,
  isVisibleElement,
  isVoidElement,
} from '../utils/dom-helpers';
import ListTabInputPlugin from '../utils/plugins/lists/tab-input-plugin';
import LumpNodeTabInputPlugin from '../utils/plugins/lump-node/tab-input-plugin';
import TableTabInputPlugin from '../utils/plugins/table/tab-input-plugin';
import { checkManipulationByPlugins } from './input-handler';

const PLUGINS = [
  new LumpNodeTabInputPlugin(),
  new ListTabInputPlugin(),
  new TableTabInputPlugin(),
];

export default function handleTab() {
  return function (editor: Editor, event: KeyboardEvent) {
    const selection = window.getSelection();

    if (
      selection !== null &&
      selection.isCollapsed &&
      editor.view.domRoot.contains(selection.anchorNode)
    )
      event.preventDefault();
    const manipulation = getNextManipulation(editor, event);
    // Check if we can execute it.
    const { mayExecute, dispatchedExecutor } = checkManipulationByPlugins(
      editor,
      manipulation,
      PLUGINS
    );

    // Error if we're not allowed to execute.
    if (!mayExecute) {
      warn(`Not allowed to execute manipulation`, {
        id: 'tab-input-handler-manipulation-not-allowed',
      });
      return;
    }

    // Run the manipulation.
    if (dispatchedExecutor) {
      // NOTE: We should pass some sort of editor interface here in the future.
      dispatchedExecutor(manipulation, editor);
    } else {
      handleNativeManipulation(manipulation, editor);
    }

    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
  };
}

function handleNativeManipulation(
  manipulation: TabHandlerManipulation,
  editor: Editor
) {
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
    window.getSelection()?.collapse(textNode, textNode.length);
    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
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
    window.getSelection()?.collapse(textNode, textNode.length);
    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
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
    window.getSelection()?.collapse(textNode, 0);
    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
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
    window.getSelection()?.collapse(textNode, 0);
    const tr = editor.state.createTransaction();
    tr.readFromView(editor.view);
    editor.dispatchTransaction(tr, false);
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

function getNextManipulation(
  editor: Editor,
  event: KeyboardEvent
): TabHandlerManipulation {
  const selection = window.getSelection();
  if (!(selection && selection.isCollapsed)) {
    throw new Error('Selection is required for tab input');
  }

  if (event.shiftKey) {
    return helpGetShiftTabNextManipulation(selection, editor);
  } else {
    return helpGetTabNextManipulation(selection, editor);
  }
}

function helpGetShiftTabNextManipulation(
  selection: Selection,
  editor: Editor
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
      return !isVoidElement(node) && isElement(node) && isVisibleElement(node);
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
    nextManipulation.node.isSameNode(editor.view.domRoot)
  ) {
    nextManipulation = {
      type: 'moveCursorBeforeEditor',
      node: nextManipulation.node,
    };
  }

  return nextManipulation;
}

function helpGetTabNextManipulation(
  selection: Selection,
  editor: Editor
): TabHandlerManipulation {
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
      return !isVoidElement(node) && isElement(node) && isVisibleElement(node);
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
    nextManipulation.node.isSameNode(editor.view.domRoot)
  ) {
    nextManipulation = {
      type: 'moveCursorAfterEditor',
      node: nextManipulation.node,
    };
  }

  return nextManipulation;
}
