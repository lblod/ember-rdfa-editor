import Modifier from 'ember-modifier';
import { SayController, TextSelection } from '..';
import { registerDestructor } from '@ember/destroyable';

function removeListeners(instance: LeaveWithArrowKeysModifier) {
  instance.element?.removeEventListener(
    'keydown',
    instance.setPositionBeforeArrowKeyLoose,
  );
  instance.element?.removeEventListener('keyup', instance.leaveEdgeOnArrowKey);
}

/* Set the cursor before or behind the node after `startPosNode`
 * when pressing the left or right arrow key respectively.
 */
export default class LeaveWithArrowKeysModifier extends Modifier {
  // We only want to move out if the cursor was already at the edge
  // This can only be known by getting the position before the keypress
  // and comparing after the keypress, when the cursor move already happened.
  cursorPositionKeyDown: number | null = null;
  element: HTMLElement = null;
  controller: SayController = null;
  getPos: () => number | undefined;

  constructor(owner, args) {
    super(owner, args);

    registerDestructor(this, removeListeners);
  }

  modify(
    element: HTMLElement,
    [controller, getPos]: [SayController, () => number | undefined],
  ) {
    if (!this.element) {
      // initialize element once as `modify` will get called everytime a parameter changes.
      // Although in practice changes to `getPos` will make the descructor get called instead.
      this.element = element;
      this.element.addEventListener(
        'keydown',
        this.setPositionBeforeArrowKeyLoose,
      );
      this.element.addEventListener('keyup', this.leaveEdgeOnArrowKey);
    }
    this.getPos = getPos;
    this.controller = controller;
  }

  setPositionBeforeArrowKeyLoose = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      this.cursorPositionKeyDown = (
        event.target as HTMLInputElement
      ).selectionStart;
    }
  };

  leaveEdgeOnArrowKey = (event: KeyboardEvent) => {
    const finalPos = (event.target as HTMLInputElement).value.length;
    if (event.key === 'ArrowRight' && this.cursorPositionKeyDown === finalPos) {
      this.selectAfterNode();
    }
    if (event.key === 'ArrowLeft' && this.cursorPositionKeyDown === 0) {
      this.selectBeforeNode();
    }
    this.cursorPositionKeyDown = null;
  };

  setSelectionAt(pos: number) {
    const tr = this.controller.mainEditorState.tr;
    tr.setSelection(
      TextSelection.create(this.controller.mainEditorState.doc, pos),
    );
    this.controller.mainEditorView.dispatch(tr);
    this.controller.focus();
  }

  selectAfterNode() {
    const node = this.controller.mainEditorState.doc.resolve(
      this.getPos(),
    ).nodeAfter;
    if (node) {
      this.setSelectionAt(this.getPos() + node.nodeSize);
    }
  }

  selectBeforeNode() {
    this.setSelectionAt(this.getPos());
  }
}
