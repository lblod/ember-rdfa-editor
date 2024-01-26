import Modifier, { type ArgsFor, type PositionalArgs } from 'ember-modifier';
import { SayController, TextSelection } from '..';
import { registerDestructor } from '@ember/destroyable';

function removeListeners(instance: LeaveWithArrowKeysModifier) {
  instance.modifiedElement?.removeEventListener(
    'keydown',
    instance.setPositionBeforeArrowKeyLoose,
  );
  instance.modifiedElement?.removeEventListener(
    'keyup',
    instance.leaveEdgeOnArrowKey,
  );
}

interface ModifierArgs {
  Args: {
    Positional: [SayController, () => number | undefined];
  };
}

/* Set the cursor before or behind the node after `startPosNode`
 * when pressing the left or right arrow key respectively.
 */
export default class LeaveWithArrowKeysModifier extends Modifier<ModifierArgs> {
  // We only want to move out if the cursor was already at the edge
  // This can only be known by getting the position before the keypress
  // and comparing after the keypress, when the cursor move already happened.
  cursorPositionKeyDown: number | null = null;
  modifiedElement: HTMLElement | null = null;
  controller: SayController | null = null;
  getPos: () => number | undefined = () => undefined;

  constructor(owner: unknown, args: ArgsFor<ModifierArgs>) {
    super(owner, args);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    registerDestructor(this, removeListeners);
  }

  modify(
    element: HTMLElement,
    [controller, getPos]: PositionalArgs<ModifierArgs>,
  ) {
    if (!this.modifiedElement) {
      // initialize element once as `modify` will get called everytime a parameter changes.
      // Although in practice changes to `getPos` will make the descructor get called instead.
      this.modifiedElement = element;
      this.modifiedElement.addEventListener(
        'keydown',
        this.setPositionBeforeArrowKeyLoose,
      );
      this.modifiedElement.addEventListener('keyup', this.leaveEdgeOnArrowKey);
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
    if (!this.controller) return;
    const tr = this.controller.mainEditorState.tr;
    tr.setSelection(
      TextSelection.create(this.controller.mainEditorState.doc, pos),
    );
    this.controller.mainEditorView.dispatch(tr);
    this.controller.focus();
  }

  selectAfterNode() {
    const pos = this.getPos();
    if (pos === undefined || !this.controller) return;
    const node = this.controller.mainEditorState.doc.resolve(pos).nodeAfter;
    if (node) {
      this.setSelectionAt(pos + node.nodeSize);
    }
  }

  selectBeforeNode() {
    const pos = this.getPos();
    if (pos === undefined || !this.controller) return;
    this.setSelectionAt(pos);
  }
}
