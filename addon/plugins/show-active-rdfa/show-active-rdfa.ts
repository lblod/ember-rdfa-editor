import ConfigStep from '@lblod/ember-rdfa-editor/core/steps/config-step';
import {
  isConfigStep,
  isSelectionStep,
  Step,
} from '@lblod/ember-rdfa-editor/core/steps/step';
import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/model/editor-plugin';

const PATH_MARKER = 'data-editor-position-level';
const RDFA_PATH_MARKER = 'data-editor-rdfa-position-level';
const SHOW_RDFA_CLASS = 'show-rdfa-path';

export default class ShowActiveRdfaPlugin implements EditorPlugin {
  private activeElement: ModelElement | null = null;
  controller!: Controller;

  get name() {
    return 'show-active-rdfa';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: Controller) {
    this.controller = controller;
    controller.addTransactionStepListener(
      this.onTransactionDispatch.bind(this)
    );
  }

  onTransactionDispatch(transaction: Transaction, steps: Step[]) {
    const configSteps: ConfigStep[] = steps.filter(
      (step) => isConfigStep(step) && step.key === 'showRdfaBlocks'
    ) as ConfigStep[];
    if (configSteps.length) {
      const lastStep = configSteps[configSteps.length - 1];
      const rootNode = this.controller.view.domRoot;
      if (lastStep.value) {
        rootNode.classList.add(SHOW_RDFA_CLASS);
      } else {
        rootNode.classList.remove(SHOW_RDFA_CLASS);
      }
    }
    if (steps.some(isSelectionStep)) {
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
