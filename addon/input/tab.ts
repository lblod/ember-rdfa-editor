import { ensureValidTextNodeForCaret } from '../editor/utils';
import Controller from '../model/controller';
import {
  isElement,
  isTextNode,
  isVisibleElement,
  isVoidElement,
} from '../utils/dom-helpers';
import {
  MoveCursorAfterEditorManipulation,
  MoveCursorAfterElementManipulation,
  MoveCursorBeforeEditorManipulation,
  MoveCursorBeforeElementManipulation,
  MoveCursorToEndOfElementManipulation,
  MoveCursorToStartOfElementManipulation,
} from './manipulation';

export type TabHandlerManipulation =
  | MoveCursorBeforeElementManipulation
  | MoveCursorToEndOfElementManipulation
  | MoveCursorBeforeEditorManipulation
  | MoveCursorToStartOfElementManipulation
  | MoveCursorAfterElementManipulation
  | MoveCursorAfterEditorManipulation;

export default function handleTab() {
  return function (controller: Controller, event: KeyboardEvent) {
    const selection = window.getSelection();

    if (
      selection !== null &&
      selection.isCollapsed &&
      controller.view.domRoot.contains(selection.anchorNode)
    )
      event.preventDefault();
    const manipulation = getNextManipulation(controller, event);
    // // Check if we can execute it.
    // const { mayExecute, dispatchedExecutor } = checkManipulationByPlugins(
    //   editor,
    //   manipulation,
    //   PLUGINS
    // );

    // Error if we're not allowed to execute.
    // if (!mayExecute) {
    //   warn(`Not allowed to execute manipulation`, {
    //     id: 'tab-input-handler-manipulation-not-allowed',
    //   });
    //   return;
    // }

    // // Run the manipulation.
    // if (dispatchedExecutor) {
    //   // NOTE: We should pass some sort of editor interface here in the future.
    //   dispatchedExecutor(manipulation, editor);
    // } else {
    handleNativeManipulation(manipulation, controller);
    // }

    const tr = controller.createTransaction();
    tr.readFromView(controller.view);
    controller.dispatchTransaction(tr, false);
  };
}

function handleNativeManipulation(
  manipulation: TabHandlerManipulation,
  controller: Controller
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
    const tr = controller.createTransaction();
    tr.readFromView(controller.view);
    controller.dispatchTransaction(tr, false);
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
    const tr = controller.createTransaction();
    tr.readFromView(controller.view);
    controller.dispatchTransaction(tr, false);
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
    const tr = controller.createTransaction();
    tr.readFromView(controller.view);
    controller.dispatchTransaction(tr, false);
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
    const tr = controller.createTransaction();
    tr.readFromView(controller.view);
    controller.dispatchTransaction(tr, false);
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
  controller: Controller,
  event: KeyboardEvent
): TabHandlerManipulation {
  const selection = window.getSelection();
  if (!(selection && selection.isCollapsed)) {
    throw new Error('Selection is required for tab input');
  }

  if (event.shiftKey) {
    return helpGetShiftTabNextManipulation(selection, controller);
  } else {
    return helpGetTabNextManipulation(selection, controller);
  }
}

function helpGetShiftTabNextManipulation(
  selection: Selection,
  controller: Controller
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
    nextManipulation.node.isSameNode(controller.view.domRoot)
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
  controller: Controller
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
    nextManipulation.node.isSameNode(controller.view.domRoot)
  ) {
    nextManipulation = {
      type: 'moveCursorAfterEditor',
      node: nextManipulation.node,
    };
  }

  return nextManipulation;
}
