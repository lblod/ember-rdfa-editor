import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import Controller, {
  EditorController,
} from '@lblod/ember-rdfa-editor/model/controller';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
// import { ConfigUpdatedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';

const PATH_MARKER = 'data-editor-position-level';
const RDFA_PATH_MARKER = 'data-editor-rdfa-position-level';
// const SHOW_RDFA_CLASS = 'show-rdfa-path';

export default class ShowActiveRdfaPlugin implements EditorPlugin {
  private activeElement: ModelElement | null = null;
  controller!: Controller;
  get name() {
    return 'show-active-rdfa';
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: EditorController) {
    this.controller = controller;
    // TODO: reimplement this with transaction listener
    // controller.onEvent('configUpdated', (event: ConfigUpdatedEvent) => {
    //   if (event.payload.changedKey === 'showRdfaBlocks') {
    //     const rootNode = controller.domRoot;
    //     if (event.payload.newValue) {
    //       rootNode.classList.add(SHOW_RDFA_CLASS);
    //     } else {
    //       rootNode.classList.remove(SHOW_RDFA_CLASS);
    //     }
    //   }
    // });
    // controller.addTransactionListener(this.onTransactionDispatch.bind(this));
  }

  onTransactionDispatch(transaction: Transaction, operations: Operation[]) {
    if (operations.some((op) => op.type === 'selection-operation')) {
      this.updateAttributes(transaction);
    }
  }

  updateAttributes(transaction: Transaction) {
    removePathAttributes();
    const ancestryPath =
      transaction.currentSelection.lastRange?.findCommonAncestorsWhere(
        ModelNode.isModelElement
      );
    if (ancestryPath) {
      let level = 0;
      let rdfaLevel = 0;

      for (const element of ancestryPath) {
        const domNode = this.controller.view.modelToView(
          transaction.workingCopy,
          element
        );

        if (domNode && isElement(domNode)) {
          if (!element.getRdfaAttributes().isEmpty) {
            domNode.setAttribute(RDFA_PATH_MARKER, rdfaLevel.toString());
            rdfaLevel += 1;
          }
          domNode.setAttribute(PATH_MARKER, level.toString());
          level += 1;
        }
      }
    }
    transaction.readFromView(this.controller.view);
  }
}
function removePathAttributes() {
  // clean old marks
  for (const oldNode of document.querySelectorAll(`[${PATH_MARKER}]`)) {
    oldNode.removeAttribute(PATH_MARKER);
  }
  // clean old RDFa marks
  for (const oldNode of document.querySelectorAll(`[${RDFA_PATH_MARKER}]`)) {
    oldNode.removeAttribute(RDFA_PATH_MARKER);
  }
}
